#!/usr/bin/env python3
"""
Cascade CMS uploader.

Mirrors a local build directory into a Cascade site via the REST v1 API.
Creates folders top-down, then creates or edits files (upsert), so repeated
runs are safe. Dry-run is the default.
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Extensions sent via the "text" field. Everything else goes through "data"
# as a signed byte array.
TEXT_EXTENSIONS = {
    ".html", ".htm", ".css", ".js", ".mjs", ".json", ".xml", ".txt",
    ".md", ".svg", ".csv", ".vtt", ".webmanifest",
}

# Cascade has more than one phrasing for "absent". Reads by id say the first;
# reads by path say the second. Used to tell "not found" apart from a real
# error, so we don't create on top of a permissions failure.
NOT_FOUND_MARKERS = (
    "does not exist",
    "unable to identify an entity",
)

# Never uploaded. OS and editor droppings that are not part of a build.
DEFAULT_EXCLUDES = {
    ".DS_Store", "Thumbs.db", "desktop.ini", ".localized",
    "__MACOSX", ".git", ".gitignore", ".gitkeep",
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("cascade")


class Summary:
    def __init__(self) -> None:
        self.created = 0
        self.edited = 0
        self.skipped = 0
        self.failed = 0
        self.failures: List[str] = []

    def fail(self, site: str, path: str, message: str) -> None:
        self.failed += 1
        self.failures.append(f"{site} | {path} | {message}")

    def report(self) -> None:
        total = self.created + self.edited + self.skipped + self.failed
        logger.info("--- RUN SUMMARY ---")
        logger.info("Total:   %d", total)
        logger.info("Created: %d", self.created)
        logger.info("Edited:  %d", self.edited)
        logger.info("Skipped: %d", self.skipped)
        logger.info("Failed:  %d", self.failed)
        if self.failures:
            logger.info("Failures:")
            for line in self.failures:
                logger.info("  %s", line)


class CascadeUploader:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        site_name: str,
        root_path: str = "/",
        metadata_set_path: str = "Default",
        dry_run: bool = True,
        rate_limit_delay: float = 0.5,
        excludes: Optional[Set[str]] = None,
    ) -> None:
        self.excludes = set(DEFAULT_EXCLUDES) | set(excludes or ())
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.site_name = site_name
        self.root_path = "/" + root_path.strip("/") if root_path.strip("/") else "/"
        self.metadata_set_path = metadata_set_path
        self.dry_run = dry_run
        self.rate_limit_delay = rate_limit_delay

        self.session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"],
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        self.summary = Summary()
        self.source_dir: Optional[Path] = None
        self._known_folders: Set[str] = set()

    # ---------- HTTP ----------

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _get(self, endpoint: str) -> Optional[dict]:
        # Reads always run, including in dry-run: they are safe and they make
        # the dry-run plan (create vs edit) accurate.
        try:
            resp = self.session.get(self.base_url + endpoint, headers=self._headers(), timeout=30)
            resp.raise_for_status()
            return resp.json()
        except (requests.RequestException, ValueError) as exc:
            logger.error("GET %s failed: %s", endpoint, exc)
            return None

    def _post(self, endpoint: str, payload: dict, label: str) -> Optional[dict]:
        if self.dry_run:
            logger.info("[DRY-RUN] POST %s  (%s)", endpoint, label)
            logger.info("[DRY-RUN] %s", self._preview(payload))
            return {"success": True, "dryRun": True}
        try:
            resp = self.session.post(
                self.base_url + endpoint, headers=self._headers(), json=payload, timeout=120
            )
            resp.raise_for_status()
            return resp.json()
        except (requests.RequestException, ValueError) as exc:
            logger.error("POST %s failed: %s", endpoint, exc)
            return None
        finally:
            time.sleep(self.rate_limit_delay)

    @staticmethod
    def _preview(payload: dict) -> str:
        """Payload as JSON, with long byte arrays and text truncated."""

        def trim(obj):
            if isinstance(obj, dict):
                return {k: trim(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return obj if len(obj) <= 12 else obj[:12] + [f"...({len(obj)} bytes)"]
            if isinstance(obj, str) and len(obj) > 200:
                return obj[:200] + f"...({len(obj)} chars)"
            return obj

        return json.dumps(trim(payload), indent=2)

    # ---------- paths ----------

    def _is_excluded(self, local: Path) -> bool:
        """True if the file, or any folder above it under source_dir, is excluded."""
        rel = local.relative_to(self.source_dir)
        return any(part in self.excludes for part in rel.parts)

    def _cascade_path(self, local: Path) -> str:
        rel = local.relative_to(self.source_dir).as_posix()
        root = self.root_path.rstrip("/")
        return f"{root}/{rel}" if root else f"/{rel}"

    @staticmethod
    def _parent_of(cascade_path: str) -> str:
        parent = cascade_path.rsplit("/", 1)[0]
        return parent or "/"

    @staticmethod
    def _name_of(cascade_path: str) -> str:
        return cascade_path.rsplit("/", 1)[-1]

    # ---------- assets ----------

    def _read(self, asset_type: str, cascade_path: str) -> Tuple[str, Optional[dict]]:
        """Returns (status, asset) where status is 'found' | 'missing' | 'error'."""
        result = self._get(f"/api/v1/read/{asset_type}/{self.site_name}{cascade_path}")
        if result is None:
            return "error", None
        if result.get("success"):
            return "found", result.get("asset", {}).get(asset_type, {})
        message = result.get("message", "")
        lowered = message.lower()
        if any(marker in lowered for marker in NOT_FOUND_MARKERS):
            return "missing", None
        logger.error("Read %s %s failed: %s", asset_type, cascade_path, message)
        return "error", None

    def _content_fields(self, local: Path) -> Optional[dict]:
        """The text or data field for a file asset."""
        try:
            raw = local.read_bytes()
        except OSError as exc:
            logger.error("Cannot read %s: %s", local, exc)
            return None
        if local.suffix.lower() in TEXT_EXTENSIONS:
            try:
                return {"text": raw.decode("utf-8")}
            except UnicodeDecodeError:
                logger.warning("%s is not valid UTF-8; sending as binary", local.name)
        # Cascade expects Java signed bytes (-128..127).
        return {"data": [b - 256 if b > 127 else b for b in raw]}

    def _ensure_folder(self, cascade_path: str) -> bool:
        if cascade_path in self._known_folders:
            return True

        status, _ = self._read("folder", cascade_path)
        if status == "found":
            self._known_folders.add(cascade_path)
            self.summary.skipped += 1
            logger.info("%s | folder | exists", cascade_path)
            return True
        if status == "error":
            self.summary.fail(self.site_name, cascade_path, "folder read failed")
            return False

        payload = {
            "asset": {
                "folder": {
                    "name": self._name_of(cascade_path),
                    "parentFolderPath": self._parent_of(cascade_path),
                    "siteName": self.site_name,
                }
            }
        }
        result = self._post("/api/v1/create", payload, f"create folder {cascade_path}")
        if result and result.get("success"):
            self._known_folders.add(cascade_path)
            self.summary.created += 1
            logger.info("%s | folder | created", cascade_path)
            return True

        message = result.get("message", "unknown error") if result else "request failed"
        self.summary.fail(self.site_name, cascade_path, message)
        logger.error("%s | folder | FAILED: %s", cascade_path, message)
        return False

    def _upsert_file(self, local: Path, cascade_path: str) -> bool:
        content = self._content_fields(local)
        if content is None:
            self.summary.fail(self.site_name, cascade_path, "local read failed")
            return False

        status, existing = self._read("file", cascade_path)
        if status == "error":
            self.summary.fail(self.site_name, cascade_path, "file read failed")
            return False

        if status == "found":
            # Edit sends the whole asset back, so untouched fields (metadata,
            # shouldBePublished, tags) survive. Only the content changes.
            asset = dict(existing or {})
            asset.pop("text", None)
            asset.pop("data", None)
            asset.update(content)
            payload = {"asset": {"file": asset}}
            result = self._post("/api/v1/edit", payload, f"edit file {cascade_path}")
            verb, counter = "edited", "edited"
        else:
            asset = {
                "name": self._name_of(cascade_path),
                "parentFolderPath": self._parent_of(cascade_path),
                "siteName": self.site_name,
                "metadataSetPath": self.metadata_set_path,
            }
            asset.update(content)
            payload = {"asset": {"file": asset}}
            result = self._post("/api/v1/create", payload, f"create file {cascade_path}")
            verb, counter = "created", "created"

        if result and result.get("success"):
            setattr(self.summary, counter, getattr(self.summary, counter) + 1)
            logger.info("%s | file | %s", cascade_path, verb)
            return True

        message = result.get("message", "unknown error") if result else "request failed"
        self.summary.fail(self.site_name, cascade_path, message)
        logger.error("%s | file | FAILED: %s", cascade_path, message)
        return False

    def publish(self, asset_id: Optional[str] = None, asset_type: str = "folder") -> bool:
        """
        Queue an asset for publishing.

        success only means the asset reached the publish queue, not that
        publishing finished. Watch the queue in Cascade for actual progress.

        Publishing a folder publishes everything beneath it.
        """
        # Verified against QA: the type segment is required. A bare id returns
        # "No bean specified", which reads like a body problem but is not.
        if asset_id:
            endpoint = f"/api/v1/publish/{asset_type}/{asset_id}"
            target = f"{asset_type} id {asset_id}"
        else:
            endpoint = f"/api/v1/publish/{asset_type}/{self.site_name}{self.root_path}"
            target = f"{asset_type} {self.root_path}"

        payload = {"publishInformation": {"unpublish": False}}
        result = self._post(endpoint, payload, f"publish {target}")
        if result and result.get("success"):
            logger.info("Queued for publish: %s", target)
            return True
        message = result.get("message", "unknown error") if result else "request failed"
        self.summary.fail(self.site_name, target, f"publish: {message}")
        logger.error("Publish failed: %s", message)
        return False

    # ---------- walk ----------

    def _resolve_changed(self, entries: List[str]) -> Set[Path]:
        """
        Map changed-file entries onto real paths under source_dir.

        git diff emits repo-root-relative paths ("dist/index.html") while
        source_dir is often already "dist", so try both interpretations.
        """
        resolved: Set[Path] = set()
        src_parts = self.source_dir.parts
        for entry in entries:
            rel = Path(entry)
            candidates = [self.source_dir / rel, Path.cwd() / rel]
            # git emits repo-root-relative paths ("src/site/index.html") while
            # source_dir is the build dir itself (".../repo/src/site"). Strip any
            # leading components that already match the tail of source_dir.
            for depth in range(len(rel.parts) - 1, 0, -1):
                if src_parts[-depth:] == rel.parts[:depth]:
                    candidates.insert(0, self.source_dir.joinpath(*rel.parts[depth:]))
            for candidate in candidates:
                try:
                    full = candidate.resolve()
                except OSError:
                    continue
                if not full.is_file():
                    continue
                try:
                    full.relative_to(self.source_dir)
                except ValueError:
                    continue  # outside the build dir, not ours to upload
                resolved.add(full)
                break
            else:
                logger.info("Not found under %s, skipping: %s", self.source_dir, entry)
        return resolved

    def upload(self, source_dir: str, changed_files: Optional[List[str]] = None) -> Summary:
        root = Path(source_dir).resolve()
        if not root.is_dir():
            logger.error("Source directory not found: %s", root)
            self.summary.fail(self.site_name, str(root), "source directory missing")
            return self.summary
        self.source_dir = root

        # The upload root must already exist in Cascade; never try to create it.
        self._known_folders.add(self.root_path)

        if changed_files is not None:
            logger.info("Change-detection mode: %d entries", len(changed_files))
            files = self._resolve_changed(changed_files)
        else:
            logger.info("Full upload mode")
            files = {p.resolve() for p in root.rglob("*") if p.is_file()}

        excluded = {p for p in files if self._is_excluded(p)}
        for path in sorted(excluded):
            logger.info("%s | excluded", path.relative_to(root).as_posix())
        files -= excluded

        if not files:
            logger.warning("Nothing to upload.")
            return self.summary

        folders: Set[Path] = set()
        for path in files:
            parent = path.parent
            while parent != root:
                folders.add(parent)
                parent = parent.parent

        logger.info("Folders to ensure: %d", len(folders))
        for folder in sorted(folders, key=lambda p: len(p.parts)):
            self._ensure_folder(self._cascade_path(folder))

        logger.info("Files to upload: %d", len(files))
        for path in sorted(files):
            self._upsert_file(path, self._cascade_path(path))

        return self.summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Mirror a local directory into a Cascade CMS site.")
    parser.add_argument("source_dir", help="Local build directory")
    parser.add_argument("--site-name", required=True, help="Cascade site name (case sensitive)")
    parser.add_argument("--root-path", default="/", help="Target folder in Cascade (default: /)")
    parser.add_argument("--base-url", default="https://ucsd-dev.cascadecms.com")
    parser.add_argument("--metadata-set-path", default="Default")
    parser.add_argument("--api-key", help="Defaults to CASCADE_API_KEY")
    parser.add_argument("--no-dry-run", action="store_true", help="Actually write to Cascade")
    parser.add_argument("--publish", action="store_true", help="Queue a publish after upload")
    parser.add_argument(
        "--publish-id",
        help="Asset id to publish, instead of resolving the root by path. "
             "Needed for a site root, which does not resolve by path.",
    )
    parser.add_argument(
        "--publish-type",
        default="folder",
        choices=["folder", "file", "page", "site"],
        help="Asset type for the publish call (default: folder)",
    )
    parser.add_argument("--changed-files", help="File containing changed paths, one per line")
    parser.add_argument("--rate-limit-delay", type=float, default=0.5)
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        metavar="NAME",
        help="Extra file or folder name to skip; repeatable. "
             f"Always skipped: {', '.join(sorted(DEFAULT_EXCLUDES))}",
    )
    args = parser.parse_args()

    api_key = args.api_key or os.getenv("CASCADE_API_KEY")
    if not api_key:
        logger.error("No API key. Pass --api-key or set CASCADE_API_KEY.")
        sys.exit(2)

    changed: Optional[List[str]] = None
    if args.changed_files:
        try:
            with open(args.changed_files, encoding="utf-8") as handle:
                changed = [line.strip() for line in handle if line.strip()]
        except OSError as exc:
            logger.error("Cannot read changed-files list: %s", exc)
            sys.exit(2)
        if not changed:
            logger.info("Changed-files list is empty; nothing to do.")
            sys.exit(0)

    uploader = CascadeUploader(
        base_url=args.base_url,
        api_key=api_key,
        site_name=args.site_name,
        root_path=args.root_path,
        metadata_set_path=args.metadata_set_path,
        dry_run=not args.no_dry_run,
        rate_limit_delay=args.rate_limit_delay,
        excludes=set(args.exclude),
    )

    logger.info(
        "Site=%s root=%s dry_run=%s", uploader.site_name, uploader.root_path, uploader.dry_run
    )
    summary = uploader.upload(args.source_dir, changed)

    if args.publish and summary.failed == 0:
        uploader.publish(args.publish_id, args.publish_type)
    elif args.publish:
        logger.warning("Skipping publish: %d failures during upload.", summary.failed)

    summary.report()
    sys.exit(1 if summary.failed else 0)


if __name__ == "__main__":
    main()

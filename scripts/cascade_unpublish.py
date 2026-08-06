#!/usr/bin/env python3
"""
Cascade CMS unpublisher.

Removes assets from the live site and then from Cascade itself. For each
asset: read it to confirm it exists, queue an unpublish so the rendered
files leave every publish destination, wait for the queue to drain, then
delete the asset so a later folder publish cannot resurrect it. Dry-run is
the default.

Assets are given as TYPE:PATH entries, for example:

    python scripts/cascade_unpublish.py \
        folder:/training-resources/videos \
        file:/_resources/js/video-progress.js
"""

import argparse
import logging
import os
import sys
import time
from typing import List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Same phrasing pairs as cascade_uploader.py: reads by id say the first,
# reads by path say the second.
NOT_FOUND_MARKERS = (
    "does not exist",
    "unable to identify an entity",
)

ASSET_TYPES = {"file", "folder", "page"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("cascade-unpublish")


class CascadeUnpublisher:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        site_name: str,
        dry_run: bool = True,
        settle_seconds: int = 90,
        rate_limit_delay: float = 0.5,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.site_name = site_name
        self.dry_run = dry_run
        self.settle_seconds = settle_seconds
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

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _get(self, endpoint: str) -> Optional[dict]:
        # Reads always run, including in dry-run, so the plan is accurate.
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

    def read(self, asset_type: str, path: str) -> Tuple[str, Optional[dict]]:
        """Return ("found" | "missing" | "error", asset-or-None)."""
        result = self._get(f"/api/v1/read/{asset_type}/{self.site_name}{path}")
        if result and result.get("success"):
            return "found", result.get("asset")
        message = (result or {}).get("message", "")
        if any(marker in message.lower() for marker in NOT_FOUND_MARKERS):
            return "missing", None
        logger.error("%s | read failed: %s", path, message or "request failed")
        return "error", None

    def unpublish(self, asset_type: str, path: str) -> bool:
        """Queue removal of the rendered files from every publish destination."""
        endpoint = f"/api/v1/publish/{asset_type}/{self.site_name}{path}"
        payload = {"publishInformation": {"unpublish": True}}
        result = self._post(endpoint, payload, f"unpublish {asset_type} {path}")
        if result and result.get("success"):
            logger.info("%s | queued for unpublish", path)
            return True
        logger.error("%s | unpublish FAILED: %s", path, (result or {}).get("message", "request failed"))
        return False

    def delete(self, asset_type: str, path: str) -> bool:
        """Delete the asset. unpublish stays on as a second line of defence."""
        endpoint = f"/api/v1/delete/{asset_type}/{self.site_name}{path}"
        payload = {"deleteParameters": {"unpublish": True}}
        result = self._post(endpoint, payload, f"delete {asset_type} {path}")
        if result and result.get("success"):
            logger.info("%s | deleted", path)
            return True
        logger.error("%s | delete FAILED: %s", path, (result or {}).get("message", "request failed"))
        return False

    def run(self, entries: List[Tuple[str, str]]) -> int:
        present: List[Tuple[str, str]] = []
        failures = 0

        for asset_type, path in entries:
            state, _asset = self.read(asset_type, path)
            if state == "found":
                logger.info("%s | %s | exists, will unpublish and delete", path, asset_type)
                present.append((asset_type, path))
            elif state == "missing":
                logger.info("%s | %s | already absent, nothing to do", path, asset_type)
            else:
                failures += 1

        if failures:
            logger.error("Aborting: %d asset(s) could not be read.", failures)
            return 1
        if not present:
            logger.info("Nothing to remove.")
            return 0

        for asset_type, path in present:
            if not self.unpublish(asset_type, path):
                failures += 1
        if failures:
            logger.error("Aborting before delete: %d unpublish request(s) failed.", failures)
            return 1

        # Deleting an asset whose unpublish job is still queued can strand the
        # rendered files on the web server, so give the queue time to drain.
        if not self.dry_run and self.settle_seconds:
            logger.info("Waiting %ds for the unpublish queue to drain...", self.settle_seconds)
            time.sleep(self.settle_seconds)

        for asset_type, path in present:
            if not self.delete(asset_type, path):
                failures += 1

        if failures:
            logger.error("%d delete request(s) failed. The assets may still exist in Cascade.", failures)
            return 1
        logger.info(
            "Done. %d asset(s) %s.",
            len(present),
            "would be unpublished and deleted" if self.dry_run else "unpublished and deleted",
        )
        return 0


def parse_entry(raw: str) -> Tuple[str, str]:
    asset_type, sep, path = raw.partition(":")
    if not sep or asset_type not in ASSET_TYPES or not path.startswith("/"):
        raise argparse.ArgumentTypeError(
            f"'{raw}' is not TYPE:/path with TYPE one of {sorted(ASSET_TYPES)}"
        )
    return asset_type, path.rstrip("/") or "/"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entries", nargs="+", type=parse_entry, metavar="TYPE:PATH")
    parser.add_argument("--site-name", required=True)
    parser.add_argument("--base-url", default="https://ucsd.cascadecms.com")
    parser.add_argument("--no-dry-run", action="store_true")
    parser.add_argument(
        "--settle-seconds",
        type=int,
        default=90,
        help="Pause between queueing the unpublish and deleting (default 90)",
    )
    args = parser.parse_args()

    api_key = os.environ.get("CASCADE_API_KEY", "")
    if not api_key:
        logger.error("CASCADE_API_KEY is not set")
        sys.exit(1)

    # Refuse to remove a site root, however it was spelled.
    if any(path == "/" for _t, path in args.entries):
        logger.error("Refusing to unpublish the site root")
        sys.exit(1)

    unpublisher = CascadeUnpublisher(
        base_url=args.base_url,
        api_key=api_key,
        site_name=args.site_name,
        dry_run=not args.no_dry_run,
        settle_seconds=args.settle_seconds,
    )
    sys.exit(unpublisher.run(args.entries))


if __name__ == "__main__":
    main()

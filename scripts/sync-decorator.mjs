import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, cp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { load } from "cheerio";

// Pins the pristine UC San Diego Decorator 5 templates into vendor/decorator-5/
// so the chrome integrity gate has a source of truth that is a file on disk
// rather than a rendered page an agent has to scrape.
//
//   (no flag)  download, extract, rewrite vendor/decorator-5/ and the lockfile
//   --check    report whether upstream moved; write nothing, exit 1 on drift
//   --derive   regenerate config/chrome-selectors.json from the vendored files
//
// UCSD publishes no version manifest for Decorator 5 — the CDN has no
// version.json and the ZIP carries no version marker — so the lockfile records
// the upstream ETag, Last-Modified, and a sha256 of the archive as the version
// identity. If a manifest is published later, prefer it over these headers.

const execFileAsync = promisify(execFile);

const ARCHIVE_URL = "https://developer.ucsd.edu/_files/decorator-downloads/v5/Decorator-V5.zip";
const VENDOR_DIR = path.resolve("vendor/decorator-5");
const LOCKFILE = path.join(VENDOR_DIR, "decorator.lock.json");
const SELECTORS_JSON = path.resolve("config/chrome-selectors.json");

// Only the markup and the readable stylesheet. Fonts, images, minified scripts
// and bundled vendor libraries are served from cdn.ucsd.edu and would add ~14 MB
// of binaries to the repository for no reviewable benefit.
const VENDORED_TREES = [
  { from: "templates", to: "templates", match: /\.html$/ },
  { from: "kitchen-sink", to: "kitchen-sink", match: /\.html$/ },
  { from: "widgets", to: "widgets", match: /\.html$/ },
  { from: "css", to: "styles", match: /^base\.css$/ },
];

// The template the chrome contract is derived from. Every Decorator template
// carries the same shell; two-column is the closest match to this site's layout.
const REFERENCE_TEMPLATE = "templates/two-column.html";

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function readLockfile() {
  try {
    return JSON.parse(await readFile(LOCKFILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`vendor/decorator-5/decorator.lock.json is not valid JSON: ${error.message}`);
  }
}

async function fetchArchive(previous) {
  const headers = { "User-Agent": "tritonai-website-decorator-sync" };
  if (previous?.upstream?.etag) headers["If-None-Match"] = previous.upstream.etag;
  const response = await fetch(ARCHIVE_URL, { headers, signal: AbortSignal.timeout(180000) });
  if (response.status === 304) return { unchanged: true };
  if (!response.ok) throw new Error(`Decorator archive responded ${response.status} for ${ARCHIVE_URL}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    unchanged: false,
    buffer,
    upstream: {
      url: ARCHIVE_URL,
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      bytes: buffer.length,
      sha256: sha256(buffer),
    },
  };
}

async function extractArchive(buffer) {
  try {
    await execFileAsync("unzip", ["-v"]);
  } catch {
    throw new Error("`unzip` is required to extract the Decorator archive but was not found on PATH.");
  }
  const workdir = await mkdtemp(path.join(tmpdir(), "decorator-"));
  const archive = path.join(workdir, "Decorator-V5.zip");
  await writeFile(archive, buffer);
  await execFileAsync("unzip", ["-qo", archive, "-d", path.join(workdir, "extracted")], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return { workdir, root: path.join(workdir, "extracted") };
}

async function collectTree(root, tree) {
  const source = path.join(root, tree.from);
  const exists = await stat(source).then(() => true).catch(() => false);
  if (!exists) throw new Error(`Decorator archive is missing the ${tree.from}/ directory.`);
  const names = (await readdir(source)).filter((name) => tree.match.test(name)).sort();
  return names.map((name) => ({
    relative: path.posix.join(tree.to, name),
    absolute: path.join(source, name),
  }));
}

async function syncVendorTree() {
  const previous = await readLockfile();
  const result = await fetchArchive(previous);
  if (result.unchanged) {
    console.log("Decorator archive is unchanged upstream (HTTP 304). Nothing to do.");
    return { changed: false };
  }
  if (previous?.upstream?.sha256 === result.upstream.sha256) {
    console.log("Decorator archive is byte-identical to the pinned copy. Nothing to do.");
    return { changed: false };
  }

  const { workdir, root } = await extractArchive(result.buffer);
  try {
    const files = [];
    for (const tree of VENDORED_TREES) files.push(...(await collectTree(root, tree)));
    const indexExists = await stat(path.join(root, "index.html")).then(() => true).catch(() => false);
    if (indexExists) files.push({ relative: "index.html", absolute: path.join(root, "index.html") });
    if (!files.some((file) => file.relative === REFERENCE_TEMPLATE)) {
      throw new Error(`Decorator archive is missing ${REFERENCE_TEMPLATE}; refusing to write a partial vendor tree.`);
    }

    await rm(VENDOR_DIR, { recursive: true, force: true });
    const assets = [];
    for (const file of files) {
      const destination = path.join(VENDOR_DIR, file.relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(file.absolute, destination);
      const contents = await readFile(destination);
      assets.push({ path: file.relative, bytes: contents.length, sha256: sha256(contents) });
    }

    const lockfile = {
      schemaVersion: 1,
      fetchedAt: new Date().toISOString(),
      // UCSD ships no version number in the archive. These upstream headers are
      // the only version identity available; see the note at the top of the file.
      version: null,
      upstream: result.upstream,
      referenceTemplate: REFERENCE_TEMPLATE,
      assets,
    };
    await writeFile(LOCKFILE, `${JSON.stringify(lockfile, null, 2)}\n`);
    console.log(`Vendored ${assets.length} Decorator files into ${path.relative(process.cwd(), VENDOR_DIR)}.`);
    console.log(`Upstream Last-Modified: ${result.upstream.lastModified ?? "(none)"}  sha256: ${result.upstream.sha256.slice(0, 16)}…`);
    return { changed: true, lockfile };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

async function checkUpstream() {
  const previous = await readLockfile();
  if (!previous) {
    console.error("No vendor/decorator-5/decorator.lock.json. Run `npm run sync:decorator` first.");
    process.exitCode = 1;
    return;
  }
  const response = await fetch(ARCHIVE_URL, {
    method: "HEAD",
    headers: { "User-Agent": "tritonai-website-decorator-sync" },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Decorator archive responded ${response.status} for ${ARCHIVE_URL}`);
  const etag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");
  if (etag && etag === previous.upstream?.etag) {
    console.log(`Decorator archive is current (ETag ${etag}).`);
    return;
  }
  console.error("The UC San Diego Decorator archive changed upstream.");
  console.error(`  pinned:  ${previous.upstream?.etag ?? "(none)"}  ${previous.upstream?.lastModified ?? ""}`);
  console.error(`  current: ${etag ?? "(none)"}  ${lastModified ?? ""}`);
  console.error("Run `npm run sync:decorator` and `npm run sync:decorator -- --derive`, then review the selector diff.");
  process.exitCode = 1;
}

/* ------------------------------------------------------- selector derivation */

/**
 * Read the structural invariants out of the pristine template.
 *
 * Two things are deliberately never derived:
 *
 *  - `id` values. The build rewrites the search ids (`q-m` upstream becomes
 *    `search-term-mobile` here, scripts/build.mjs normalizeNavigationMarkup),
 *    so a derived rule that pinned ids would fail on every build.
 *  - Site-specific values. Upstream points the search at
 *    act.ucsd.edu/cwp/tools/search-redir with two scope options; TritonAI points
 *    it at its own index with three. Those belong in the hand-maintained
 *    overlay, config/chrome-selectors.local.json, not here.
 *
 * What survives is the shape: a drawer search is a form with a scope select and
 * a search-term input. That is the invariant the incident broke.
 */
async function deriveSelectors() {
  const lockfile = await readLockfile();
  if (!lockfile) throw new Error("No vendor/decorator-5/decorator.lock.json. Run `npm run sync:decorator` first.");
  const templatePath = path.join(VENDOR_DIR, REFERENCE_TEMPLATE);
  const $ = load(await readFile(templatePath, "utf8"));
  const rules = [];

  const drawer = $(".navmenu.navmenu-default.navmenu-fixed-left.offcanvas").first();
  if (!drawer.length) throw new Error(`${REFERENCE_TEMPLATE} has no offcanvas drawer; cannot derive the chrome contract.`);
  const drawerForm = drawer
    .find("form")
    .filter((_, element) => $(element).find("select.search-scope").length > 0 && $(element).find("input.search-term").length > 0)
    .first();
  if (drawerForm.length) {
    rules.push({
      id: "mobile-drawer.search-form",
      region: "mobile-drawer",
      within: ".search-content",
      source: `vendor/${path.posix.join("decorator-5", REFERENCE_TEMPLATE)}`,
      require: [
        { selector: `form[action][method='${drawerForm.attr("method") || "get"}']`, count: 1 },
        { selector: "form select.search-scope[name='search-scope']", count: 1 },
        { selector: `form input.search-term[type='${drawerForm.find("input.search-term").attr("type") || "search"}']`, count: 1 },
      ],
      forbid: [
        {
          selector: "a[href]",
          reason: "the drawer search must submit a form; a link to the search page loses the scope selector and the typed query",
        },
      ],
      remedy: "Restore the drawer search form from the vendor template.",
    });
  }

  const toggle = $("button.navbar-toggle[data-toggle='offcanvas']").first();
  if (toggle.length) {
    rules.push({
      id: "navbar.mobile-toggle",
      region: "navbar",
      within: "button.navbar-toggle[data-toggle='offcanvas']",
      source: `vendor/${path.posix.join("decorator-5", REFERENCE_TEMPLATE)}`,
      require: [
        { selector: "span.sr-only", count: 1 },
        { selector: ".mobile-nav-bars", count: 1 },
        { selector: ".mobile-nav-bars span.icon-bar", count: toggle.find(".mobile-nav-bars span.icon-bar").length },
        { selector: ".mobile-nav-icon", count: 1 },
      ],
      remedy: "The MENU label and the bars live inside the toggle button. Restore both from the vendor template.",
    });
  }

  const header = $("header.layout-header").first();
  if (header.length) {
    rules.push({
      id: "site-title.branding",
      region: "site-title",
      source: `vendor/${path.posix.join("decorator-5", REFERENCE_TEMPLATE)}`,
      require: [
        { selector: "a.title-header", count: header.find("section.layout-title a.title-header").length },
        { selector: "a.title-logo", count: 1 },
      ],
      remedy: "The title band carries the site title links and the UC San Diego logo link.",
    });
  }

  const navbarSearch = $("nav.navbar .search-content form").first();
  if (navbarSearch.length) {
    rules.push({
      id: "navbar.search-form",
      region: "navbar",
      within: ".search-content",
      source: `vendor/${path.posix.join("decorator-5", REFERENCE_TEMPLATE)}`,
      require: [
        { selector: "form[action]", count: 1 },
        { selector: "form select.search-scope[name='search-scope']", count: 1 },
        { selector: "form input.search-term", count: 1 },
      ],
      forbid: [{ selector: "a[href]", reason: "the desktop search must submit a form, not link away" }],
      remedy: "Restore the desktop search form from the vendor template.",
    });
  }

  const derived = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    derivedFrom: {
      lockfile: "vendor/decorator-5/decorator.lock.json",
      template: REFERENCE_TEMPLATE,
      upstreamSha256: lockfile.upstream?.sha256 ?? null,
    },
    note: "Generated by `npm run sync:decorator -- --derive`. Do not hand-edit; add site-specific rules to config/chrome-selectors.local.json and deliberate divergence to config/chrome-selectors.overrides.json.",
    rules,
  };
  await mkdir(path.dirname(SELECTORS_JSON), { recursive: true });
  await writeFile(SELECTORS_JSON, `${JSON.stringify(derived, null, 2)}\n`);
  console.log(`Derived ${rules.length} structural rules into ${path.relative(process.cwd(), SELECTORS_JSON)} from ${REFERENCE_TEMPLATE}.`);
}

async function main() {
  if (hasFlag("check")) return checkUpstream();
  if (hasFlag("derive")) return deriveSelectors();
  const { changed } = await syncVendorTree();
  if (changed) await deriveSelectors();
}

if (import.meta.url === `file://${process.argv[1]}`) await main();

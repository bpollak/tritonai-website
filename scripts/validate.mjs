import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const DIST_DIR = path.resolve("dist");
const REPORT_DIR = path.resolve("reports");
const SITE_BASE_PATH = (process.env.SITE_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
const inheritedProductionFailures = new Set([
  "/technology/ai/tritongpt/release-notes/11-24-2025-release",
  "/tritongpt/release-notes/5-1-2026-release.html",
]);
const ignoredLegacyAssets = new Set([
  "/_resources/cross-domain/respond.proxy.gif",
  "/_resources/cross-domain/respond.proxy.js",
]);
const requiredRemoteDependencies = [
  "https://cdn.ucsd.edu/cms/decorator-5/styles/base.min.css",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://www.ucsd.edu/common/_emergency-broadcast/message.js",
  "https://cdn.ucsd.edu/cms/search/js/search-api.js",
  "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js",
  "https://today.ucsd.edu/news-and-features-api?category=190&limit=3",
];

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolute, base)));
    else files.push(path.relative(base, absolute));
  }
  return files;
}

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch {
    return false;
  }
}

function toLocalPath(raw, pagePath) {
  if (!raw || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(raw) || raw.startsWith("//")) return null;
  let url;
  try {
    url = new URL(raw, `https://local.invalid/${pagePath}`);
  } catch {
    return null;
  }
  if (url.origin !== "https://local.invalid") return null;
  let pathname = decodeURIComponent(url.pathname);
  if (SITE_BASE_PATH && pathname.startsWith(`/${SITE_BASE_PATH}/`)) {
    pathname = pathname.slice(SITE_BASE_PATH.length + 1) || "/";
  }
  return pathname;
}

async function resolveLocalTarget(pathname) {
  const candidates = [];
  const clean = pathname.replace(/^\//, "");
  if (!clean || pathname.endsWith("/")) candidates.push(path.join(DIST_DIR, clean, "index.html"));
  else {
    candidates.push(path.join(DIST_DIR, clean));
    if (!path.extname(clean)) candidates.push(path.join(DIST_DIR, clean, "index.html"));
  }
  for (const candidate of candidates) if (await exists(candidate)) return true;
  return false;
}

const files = await listFiles(DIST_DIR);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const missing = [];
const inherited = [];

for (const page of htmlFiles) {
  const $ = load(await readFile(path.join(DIST_DIR, page), "utf8"));
  for (const attr of ["href", "src", "action", "poster", "data-src"]) {
    for (const element of $(`[${attr}]`).toArray()) {
      const raw = $(element).attr(attr);
      const target = toLocalPath(raw, page);
      if (!target || ignoredLegacyAssets.has(target)) continue;
      if (await resolveLocalTarget(target)) continue;
      const finding = { page: `/${page}`, attribute: attr, target };
      if (inheritedProductionFailures.has(target)) inherited.push(finding);
      else missing.push(finding);
    }
  }
}

const remoteChecks = [];
for (const url of requiredRemoteDependencies) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    remoteChecks.push({ url, status: response.status, ok: response.ok });
  } catch (error) {
    remoteChecks.push({ url, status: "FETCH_ERROR", ok: false, error: error.message });
  }
}

const newsletterCount = htmlFiles.includes("about/ai-updates.html")
  ? load(await readFile(path.join(DIST_DIR, "about/ai-updates.html"), "utf8"))("article.editorial-panel").length
  : 0;
const report = {
  checkedAt: new Date().toISOString(),
  counts: {
    files: files.length,
    htmlFiles: htmlFiles.length,
    newsletters: newsletterCount,
    missingInternalTargets: missing.length,
    inheritedProductionFailures: inherited.length,
    remoteDependencyFailures: remoteChecks.filter((check) => !check.ok).length,
  },
  missing,
  inherited,
  remoteChecks,
};
await mkdir(REPORT_DIR, { recursive: true });
await writeFile(path.join(REPORT_DIR, "validation.json"), `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(`${JSON.stringify(report.counts, null, 2)}\n`);
if (inherited.length) process.stdout.write(`Preserved ${inherited.length} inherited broken-link occurrences.\n`);
if (missing.length || remoteChecks.some((check) => !check.ok) || newsletterCount < 1) {
  process.stderr.write("Validation failed. See reports/validation.json.\n");
  process.exit(1);
} else {
  process.stdout.write("Validation passed.\n");
}

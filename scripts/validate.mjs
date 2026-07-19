import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";

const DIST_DIR = path.resolve("dist");
const REPORT_DIR = path.resolve("reports");
const CONTENT_DIR = path.resolve("content");
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

function isoDate(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}

function missingFields(object, fields) {
  return fields.filter((field) => object[field] === undefined || object[field] === null || object[field] === "");
}

async function loadMarkdownContent(directory, requiredFields, type) {
  const entries = [];
  const findings = [];
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith(".md")).sort()) {
    const parsed = matter(await readFile(path.join(directory, filename), "utf8"));
    const missing = missingFields(parsed.data, requiredFields);
    if (missing.length) findings.push({ source: `${type}/${filename}`, issue: `Missing fields: ${missing.join(", ")}` });
    entries.push({ filename, ...parsed.data, lastReviewed: isoDate(parsed.data.lastReviewed) });
  }
  return { entries, findings };
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
const accessibility = [];
const metadata = [];

const pageContent = await loadMarkdownContent(
  path.join(CONTENT_DIR, "pages"),
  ["title", "path", "description", "lastReviewed", "audiences", "source", "canonicalUrl", "relatedSlides"],
  "pages",
);
const useCaseContent = await loadMarkdownContent(
  path.join(CONTENT_DIR, "use-cases"),
  ["title", "slug", "summary", "status", "owner", "lastReviewed", "audiences", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides", "humanOversight", "measurableOutcome"],
  "use-cases",
);
const contentFindings = [...pageContent.findings, ...useCaseContent.findings];
const generatedPaths = new Set([
  ...pageContent.entries.map((entry) => entry.path),
  ...useCaseContent.entries.map((entry) => entry.canonicalUrl),
  "/use-cases/index.html",
  "/about/roadmap.html",
  "/404.html",
]);

const allowedStatuses = new Set(["Shipped", "Pilot", "In development", "Exploring"]);
for (const useCase of useCaseContent.entries) {
  if (!allowedStatuses.has(useCase.status)) contentFindings.push({ source: `use-cases/${useCase.filename}`, issue: `Unknown status: ${useCase.status}` });
}

const freshnessWarnings = [];
const freshnessFailures = [];
const today = new Date();
for (const entry of [...pageContent.entries, ...useCaseContent.entries]) {
  if (!entry.lastReviewed) {
    freshnessFailures.push({ source: entry.filename, issue: "Invalid lastReviewed date" });
    continue;
  }
  const ageDays = Math.floor((today - new Date(`${entry.lastReviewed}T12:00:00Z`)) / 86400000);
  if (ageDays > 365) freshnessFailures.push({ source: entry.filename, lastReviewed: entry.lastReviewed, ageDays });
  else if (ageDays > 120) freshnessWarnings.push({ source: entry.filename, lastReviewed: entry.lastReviewed, ageDays });
}

for (const page of htmlFiles) {
  const $ = load(await readFile(path.join(DIST_DIR, page), "utf8"));
  const route = page === "index.html" ? "/" : `/${page}`;
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

  $("video").each((_, element) => {
    const video = $(element);
    if (video.attr("controls") === undefined) accessibility.push({ page: route, issue: "Video missing controls" });
    if (video.attr("autoplay") !== undefined) accessibility.push({ page: route, issue: "Video must not autoplay" });
    const descriptionId = video.attr("aria-describedby");
    const described = descriptionId && $(`#${descriptionId}`).length === 1;
    const silentDemo = video.attr("data-silent-demo") === "true" && video.attr("muted") !== undefined && described;
    if (!video.find("track[kind='captions']").length && !silentDemo) {
      accessibility.push({ page: route, issue: "Video needs captions or an identified silent-demo description" });
    }
  });

  if (generatedPaths.has(route)) {
    if ($("main#main-content").length !== 1) accessibility.push({ page: route, issue: "Expected one main landmark" });
    if ($("h1").length !== 1) accessibility.push({ page: route, issue: `Expected one h1; found ${$("h1").length}` });
    $("img").each((_, element) => {
      if ($(element).attr("alt") === undefined) accessibility.push({ page: route, issue: "Image missing alt attribute" });
    });
    const canonical = $("link[rel='canonical']").attr("href");
    if (!canonical) metadata.push({ page: route, issue: "Missing canonical URL" });
    else if (!canonical.startsWith("https://tritonai.ucsd.edu/")) metadata.push({ page: route, issue: `Canonical URL is not absolute: ${canonical}` });
    if (!$("meta[name='description']").attr("content")) metadata.push({ page: route, issue: "Missing description" });
    if (!$("meta[property='og:title']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph title" });
    if (!$("script[type='application/ld+json'][data-tritonai-schema]").length) metadata.push({ page: route, issue: "Missing JSON-LD" });
  }
}

let routeManifest = null;
try {
  routeManifest = JSON.parse(await readFile(path.join(DIST_DIR, "_data/routes.json"), "utf8"));
} catch (error) {
  contentFindings.push({ source: "dist/_data/routes.json", issue: error.message });
}
const sitemap = await readFile(path.join(DIST_DIR, "sitemap.xml"), "utf8").catch(() => "");
const routeFindings = [];
if (!routeManifest || routeManifest.routes?.length !== htmlFiles.length) {
  routeFindings.push({ issue: `Route manifest count does not match HTML count (${routeManifest?.routes?.length || 0} vs ${htmlFiles.length})` });
} else {
  for (const route of routeManifest.routes.filter((entry) => entry.path !== "/404.html")) {
    if (!sitemap.includes(`<loc>${route.canonicalUrl}</loc>`)) routeFindings.push({ path: route.path, issue: "Missing from sitemap" });
  }
}
if (!(await exists(path.join(DIST_DIR, "404.html")))) routeFindings.push({ path: "/404.html", issue: "Custom 404 is missing" });
if (!(await exists(path.join(DIST_DIR, "robots.txt")))) routeFindings.push({ path: "/robots.txt", issue: "robots.txt is missing" });

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
  ? load(await readFile(path.join(DIST_DIR, "about/ai-updates.html"), "utf8"))("article.agent-newsletter").length
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
    contentSchemaFailures: contentFindings.length,
    freshnessWarnings: freshnessWarnings.length,
    freshnessFailures: freshnessFailures.length,
    accessibilityFailures: accessibility.length,
    metadataFailures: metadata.length,
    routeFailures: routeFindings.length,
  },
  missing,
  inherited,
  remoteChecks,
  contentFindings,
  freshnessWarnings,
  freshnessFailures,
  accessibility,
  metadata,
  routeFindings,
};
await mkdir(REPORT_DIR, { recursive: true });
await writeFile(path.join(REPORT_DIR, "validation.json"), `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(`${JSON.stringify(report.counts, null, 2)}\n`);
if (inherited.length) process.stdout.write(`Preserved ${inherited.length} inherited broken-link occurrences.\n`);
if (
  missing.length ||
  remoteChecks.some((check) => !check.ok) ||
  newsletterCount < 1 ||
  contentFindings.length ||
  freshnessFailures.length ||
  accessibility.length ||
  metadata.length ||
  routeFindings.length
) {
  process.stderr.write("Validation failed. See reports/validation.json.\n");
  process.exit(1);
} else {
  process.stdout.write("Validation passed.\n");
}

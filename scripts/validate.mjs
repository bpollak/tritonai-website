import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
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
const preconnectOrigins = ["https://cdn.ucsd.edu", "https://www.ucsd.edu", "https://tritongpt-deck.vercel.app"];
const afterRenderDecoratorScripts = [
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/modernizr.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/jquery.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/bootstrap.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/vendor.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/decorator.js",
];
const emergencyBroadcastScript = "https://www.ucsd.edu/common/_emergency-broadcast/message.js";
const tritonGptWidgetScript = "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js";
const imageBudgetBytes = 320_000;

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
const performance = [];

const assetSizeCache = new Map();
async function localAssetSize(raw, pagePath) {
  const target = toLocalPath(raw, pagePath);
  if (!target || !/^\/_images\/.+\.(?:jpe?g|png|webp)$/i.test(target)) return null;
  if (assetSizeCache.has(target)) return assetSizeCache.get(target);
  const filename = path.join(DIST_DIR, target.replace(/^\//, ""));
  const size = await stat(filename).then((entry) => entry.size).catch(() => null);
  assetSizeCache.set(target, size);
  return size;
}

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
const roadmapContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "roadmap/milestones.json"), "utf8"));
const factsContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "facts/public-facts.json"), "utf8"));
const skillsContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "skills/library.json"), "utf8"));
const homeHeroContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "home/hero.json"), "utf8"));
const roadmapRequired = ["title", "description", "owner", "lastReviewed", "source", "canonicalUrl", "items"];
const roadmapMissing = missingFields(roadmapContent, roadmapRequired);
if (roadmapMissing.length) contentFindings.push({ source: "roadmap/milestones.json", issue: `Missing fields: ${roadmapMissing.join(", ")}` });
const factRequired = ["id", "claim", "status", "owner", "lastReviewed", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides"];
for (const [index, fact] of (factsContent.facts || []).entries()) {
  const factMissing = missingFields(fact, factRequired);
  if (factMissing.length) contentFindings.push({ source: `facts/public-facts.json#${fact.id || index + 1}`, issue: `Missing fields: ${factMissing.join(", ")}` });
}
const skillsRequired = ["schemaVersion", "syncedAt", "source", "collections", "skills"];
const skillsMissing = missingFields(skillsContent, skillsRequired);
if (skillsMissing.length) contentFindings.push({ source: "skills/library.json", issue: `Missing fields: ${skillsMissing.join(", ")}` });
const skillsSourceMissing = missingFields(skillsContent.source || {}, ["repository", "url", "defaultBranch", "commitSha", "commitUrl", "commitDate"]);
if (skillsSourceMissing.length) contentFindings.push({ source: "skills/library.json#source", issue: `Missing fields: ${skillsSourceMissing.join(", ")}` });
if (skillsContent.source?.repository !== "dbalders/UCSD-Skills-Library") {
  contentFindings.push({ source: "skills/library.json#source", issue: `Unexpected repository: ${skillsContent.source?.repository || "missing"}` });
}
if (!(skillsContent.skills || []).length) contentFindings.push({ source: "skills/library.json", issue: "No public skills found" });
const allowedSkillCollections = new Set(["tritonai", "community"]);
const skillNames = new Set();
const skillPaths = new Set();
for (const [index, skill] of (skillsContent.skills || []).entries()) {
  const skillMissing = missingFields(skill, ["name", "description", "collection", "collectionLabel", "path", "directory", "sourceUrl", "directoryUrl", "resources"]);
  if (skillMissing.length) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: `Missing fields: ${skillMissing.join(", ")}` });
  if (!allowedSkillCollections.has(skill.collection)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: `Unknown collection: ${skill.collection}` });
  if (skill.collection === "community" && !skill.maintainer) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Community skill is missing a maintainer" });
  if (skillNames.has(skill.name)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Duplicate skill name" });
  if (skillPaths.has(skill.path)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Duplicate skill path" });
  skillNames.add(skill.name);
  skillPaths.add(skill.path);
}
const homeHeroMissing = missingFields(homeHeroContent, ["schemaVersion", "owner", "source", "lastReviewed", "rotationIntervalMs", "slides"]);
if (homeHeroMissing.length) contentFindings.push({ source: "home/hero.json", issue: `Missing fields: ${homeHeroMissing.join(", ")}` });
if ((homeHeroContent.slides || []).length < 2) contentFindings.push({ source: "home/hero.json", issue: "Hero rotator needs at least two slides" });
const heroSlideIds = new Set();
for (const [index, slide] of (homeHeroContent.slides || []).entries()) {
  const slideMissing = missingFields(slide, ["id", "title", "description", "image", "imageAlt", "link", "linkLabel"]);
  if (slideMissing.length) contentFindings.push({ source: `home/hero.json#${slide.id || index + 1}`, issue: `Missing fields: ${slideMissing.join(", ")}` });
  if (heroSlideIds.has(slide.id)) contentFindings.push({ source: `home/hero.json#${slide.id || index + 1}`, issue: "Duplicate slide id" });
  heroSlideIds.add(slide.id);
}
const generatedPaths = new Set([
  ...pageContent.entries.map((entry) => entry.path),
  ...useCaseContent.entries.map((entry) => entry.canonicalUrl),
  "/use-cases/index.html",
  "/about/roadmap.html",
  "/404.html",
]);

const allowedStatuses = new Set(["Shipped", "Production", "Pilot", "In development", "Exploring"]);
for (const useCase of useCaseContent.entries) {
  if (!allowedStatuses.has(useCase.status)) contentFindings.push({ source: `use-cases/${useCase.filename}`, issue: `Unknown status: ${useCase.status}` });
}
for (const [index, milestone] of (roadmapContent.items || []).entries()) {
  const milestoneMissing = missingFields(milestone, ["period", "title", "status", "summary", "owner", "lastReviewed", "source"]);
  if (milestoneMissing.length) contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: `Missing fields: ${milestoneMissing.join(", ")}` });
  if (!allowedStatuses.has(milestone.status)) contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: `Unknown status: ${milestone.status}` });
}

const freshnessWarnings = [];
const freshnessFailures = [];
const today = new Date();
const skillsSyncedAt = new Date(skillsContent.syncedAt);
if (Number.isNaN(skillsSyncedAt.valueOf())) {
  freshnessFailures.push({ source: "skills/library.json", issue: "Invalid syncedAt date" });
} else {
  const ageHours = Math.floor((today - skillsSyncedAt) / 3600000);
  if (ageHours > 336) freshnessFailures.push({ source: "skills/library.json", syncedAt: skillsContent.syncedAt, ageHours });
  else if (ageHours > 48) freshnessWarnings.push({ source: "skills/library.json", syncedAt: skillsContent.syncedAt, ageHours });
}
const freshnessEntries = [
  ...pageContent.entries,
  ...useCaseContent.entries,
  { filename: "roadmap/milestones.json", lastReviewed: isoDate(roadmapContent.lastReviewed) },
  ...(roadmapContent.items || []).map((item, index) => ({ filename: `roadmap/milestones.json#${index + 1}`, lastReviewed: isoDate(item.lastReviewed) })),
  ...(factsContent.facts || []).map((fact, index) => ({ filename: `facts/public-facts.json#${fact.id || index + 1}`, lastReviewed: isoDate(fact.lastReviewed) })),
  { filename: "home/hero.json", lastReviewed: isoDate(homeHeroContent.lastReviewed) },
];
for (const entry of freshnessEntries) {
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
  for (const attr of ["href", "src", "action", "poster", "data-src", "data-poster", "data-fallback-src", "data-after-render-src", "data-idle-src"]) {
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
    if (video.attr("data-autoplay-when-visible") !== "true") accessibility.push({ page: route, issue: "Video must autoplay when visible" });
    if (video.attr("muted") === undefined) accessibility.push({ page: route, issue: "Autoplay video must be muted" });
    if (video.attr("playsinline") === undefined) accessibility.push({ page: route, issue: "Autoplay video must play inline" });
    if (video.attr("autoplay") !== undefined) performance.push({ page: route, issue: "Video must not load through eager autoplay" });
    if (video.attr("preload") !== "none") performance.push({ page: route, issue: "Deferred video must use preload=none" });
    if (video.attr("src") || video.find("source[src]").length) performance.push({ page: route, issue: "Video source must be deferred to data-src" });
    const descriptionId = video.attr("aria-describedby");
    const described = descriptionId && $(`#${descriptionId}`).length === 1;
    const silentDemo = video.attr("data-silent-demo") === "true" && video.attr("muted") !== undefined && described;
    if (!video.find("track[kind='captions']").length && !silentDemo) {
      accessibility.push({ page: route, issue: "Video needs captions or an identified silent-demo description" });
    }
  });

  $("iframe[data-src*='youtube.com/embed']").each((_, element) => {
    const iframe = $(element);
    const iframeUrl = new URL(iframe.attr("data-src"));
    if (iframeUrl.searchParams.get("autoplay") !== "1" || iframeUrl.searchParams.get("mute") !== "1") {
      accessibility.push({ page: route, issue: "YouTube video must autoplay muted" });
    }
    if (iframe.attr("loading") !== "lazy" || iframe.attr("data-autoplay-when-visible") !== "true") {
      performance.push({ page: route, issue: "YouTube video must load only when it approaches the viewport" });
    }
    if (iframe.attr("src") !== "about:blank") performance.push({ page: route, issue: "YouTube embed has an eager source" });
  });

  const preconnects = new Set($("link[rel='preconnect']").map((_, element) => $(element).attr("href")).get());
  for (const origin of preconnectOrigins) {
    if (!preconnects.has(origin)) performance.push({ page: route, issue: `Missing preconnect for ${origin}` });
  }
  const performanceRuntime = $("script[src$='/_resources/js/site-performance.js'][defer]");
  if (performanceRuntime.length !== 1) performance.push({ page: route, issue: "Performance runtime is missing or not deferred" });
  for (const source of afterRenderDecoratorScripts) {
    const script = $(`script[data-after-render-src='${source}']`);
    if (script.length !== 1 || script.attr("src")) {
      performance.push({ page: route, issue: `Decorator dependency is not postponed until after render: ${source}` });
    }
  }
  $("script[src^='http']").each((_, element) => {
    const script = $(element);
    const source = script.attr("src") || "";
    if (script.attr("async") !== undefined || source.includes("googletagmanager.com")) return;
    performance.push({ page: route, issue: `External script blocks initial rendering: ${source}` });
  });
  const emergencyScript = $(`script[src='${emergencyBroadcastScript}']`);
  if (emergencyScript.length !== 1 || emergencyScript.attr("async") === undefined) {
    performance.push({ page: route, issue: "Emergency broadcast must remain live without blocking rendering" });
  }
  const idleWidget = $(`script[data-idle-src='${tritonGptWidgetScript}']`);
  if (idleWidget.length !== 1 || idleWidget.attr("src")) {
    performance.push({ page: route, issue: "TritonGPT widget must initialize during browser idle time" });
  }

  for (const element of $("img").toArray()) {
    const image = $(element);
    const fallback = image.attr("data-fallback-src") || image.attr("src");
    const fallbackSize = await localAssetSize(fallback, page);
    if (!fallbackSize || fallbackSize <= imageBudgetBytes) continue;
    const optimizedSource = image.attr("data-src") || image.parent("picture").find("source[type='image/webp']").attr("srcset");
    const optimizedSize = await localAssetSize(optimizedSource, page);
    if (!optimizedSource || !optimizedSize) {
      performance.push({ page: route, issue: `Oversized image lacks a WebP source: ${fallback}` });
    } else if (optimizedSize > imageBudgetBytes) {
      performance.push({ page: route, issue: `Optimized image exceeds ${imageBudgetBytes} bytes: ${optimizedSource}` });
    }
  }
  for (const element of $("[style*='background-image']").toArray()) {
    const style = $(element).attr("style") || "";
    const urls = [...style.matchAll(/url\((['\"]?)([^'\")]+)\1\)/gi)].map((match) => match[2]);
    const fallback = urls.find((url) => /\.(?:jpe?g|png)(?:$|[?#])/i.test(url));
    if (!fallback) continue;
    const optimized = urls.find((url) => /\.webp(?:$|[?#])/i.test(url));
    const fallbackSize = await localAssetSize(fallback, page);
    if (!fallbackSize || fallbackSize <= imageBudgetBytes) continue;
    const optimizedSize = await localAssetSize(optimized, page);
    if (!optimized || !optimizedSize) performance.push({ page: route, issue: `Oversized background lacks a WebP source: ${fallback}` });
    else if (optimizedSize > imageBudgetBytes) performance.push({ page: route, issue: `Optimized background exceeds ${imageBudgetBytes} bytes: ${optimized}` });
  }

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
  if (route === "/skills/index.html") {
    const renderedSkills = $("[data-skill-card]");
    if (renderedSkills.length !== (skillsContent.skills || []).length) {
      contentFindings.push({ source: route, issue: `Rendered skill count does not match catalog (${renderedSkills.length} vs ${(skillsContent.skills || []).length})` });
    }
    if ($("[data-skills-search]").length !== 1 || $("[data-skills-collection]").length !== 1) {
      accessibility.push({ page: route, issue: "Skills filters are missing" });
    }
  }
  if (route === "/") {
    if ($("#heroslider").length !== 1) accessibility.push({ page: route, issue: "Homepage hero rotator is missing" });
    if ($("#heroslider .item").length !== (homeHeroContent.slides || []).length) {
      contentFindings.push({ source: route, issue: `Rendered hero slide count does not match content (${$("#heroslider .item").length} vs ${(homeHeroContent.slides || []).length})` });
    }
    if ($("[data-home-hero-toggle]").length !== 1) accessibility.push({ page: route, issue: "Homepage hero pause control is missing" });
    const inactiveHeroImages = $("#heroslider .item:not(.active) img.first-slide");
    if (!inactiveHeroImages.length || inactiveHeroImages.filter("[data-src$='.webp']").length !== inactiveHeroImages.length) {
      performance.push({ page: route, issue: "Inactive hero images must use deferred optimized sources" });
    }
  }
}

const performanceRuntimeSource = await readFile(path.join(DIST_DIR, "_resources/js/site-performance.js"), "utf8").catch(() => "");
for (const behavior of ["IntersectionObserver", "requestIdleCallback", "data-after-render-src", 'document.addEventListener("pointerover"', 'document.addEventListener("touchstart"']) {
  if (!performanceRuntimeSource.includes(behavior)) performance.push({ page: "/_resources/js/site-performance.js", issue: `Missing runtime behavior: ${behavior}` });
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
  const attempts = [];
  for (const [attemptIndex, method] of ["HEAD", "GET", "GET"].entries()) {
    try {
      const response = await fetch(url, {
        method,
        headers: { "User-Agent": "tritonai-website-validator" },
        signal: AbortSignal.timeout(15000),
      });
      attempts.push({ attempt: attemptIndex + 1, method, status: response.status, ok: response.ok });
      if (response.ok) break;
    } catch (error) {
      attempts.push({ attempt: attemptIndex + 1, method, status: "FETCH_ERROR", ok: false, error: error.message });
    }
  }
  const successfulAttempt = attempts.find((attempt) => attempt.ok);
  const finalAttempt = successfulAttempt || attempts.at(-1);
  remoteChecks.push({ url, ...finalAttempt, attempts });
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
    skills: (skillsContent.skills || []).length,
    missingInternalTargets: missing.length,
    inheritedProductionFailures: inherited.length,
    remoteDependencyFailures: remoteChecks.filter((check) => !check.ok).length,
    contentSchemaFailures: contentFindings.length,
    freshnessWarnings: freshnessWarnings.length,
    freshnessFailures: freshnessFailures.length,
    accessibilityFailures: accessibility.length,
    metadataFailures: metadata.length,
    routeFailures: routeFindings.length,
    performanceFailures: performance.length,
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
  performance,
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
  routeFindings.length ||
  performance.length
) {
  process.stderr.write("Validation failed. See reports/validation.json.\n");
  process.exit(1);
} else {
  process.stdout.write("Validation passed.\n");
}

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
const preconnectOrigins = [
  "https://cdn.ucsd.edu",
  "https://www.ucsd.edu",
  "https://tritongpt-deck.vercel.app",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];
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

function normalizeRoute(route) {
  return route === "/index.html" ? "/" : route;
}

function navigationOwner(items, route) {
  const section = route.split("/").filter(Boolean)[0] || "";
  if (!section) return null;
  const sectionOwner = items.find((item) => (item.href.split("/").filter(Boolean)[0] || "") === section);
  if (sectionOwner) return sectionOwner;
  return items.find((item) => item.items?.some((child) => child.href === route)) || null;
}

function sidebarChildren(item) {
  return (item?.items || []).filter((child) => child.href !== item.href);
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
const navigation = [];

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
const siteContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "site.json"), "utf8"));
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
if ((homeHeroContent.slides || []).length < 1) contentFindings.push({ source: "home/hero.json", issue: "Homepage hero needs at least one slide" });
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
].map(normalizeRoute));
const landingHubPaths = new Set([
  "/",
  "/use-cases/index.html",
  ...pageContent.entries.filter((entry) => entry.landingHub === true).map((entry) => entry.path),
].map(normalizeRoute));

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
  const ids = new Map();
  $("[id]").each((_, element) => {
    const id = $(element).attr("id");
    ids.set(id, (ids.get(id) || 0) + 1);
  });
  for (const [id, count] of ids) {
    if (count > 1) navigation.push({ page: route, issue: `Duplicate id: ${id}` });
  }
  $("[tabindex]").each((_, element) => {
    const value = Number($(element).attr("tabindex"));
    if (Number.isFinite(value) && value > 0) accessibility.push({ page: route, issue: `Positive tabindex: ${value}` });
  });
  $("label[for]").each((_, element) => {
    const label = $(element);
    const targetId = label.attr("for");
    const target = $(`#${targetId}`);
    if (target.length !== 1) {
      accessibility.push({ page: route, issue: `Label target is missing or duplicated: ${targetId}` });
      return;
    }
    if (label.closest("form").get(0) !== target.closest("form").get(0)) {
      accessibility.push({ page: route, issue: `Label and control are not in the same form: ${targetId}` });
    }
  });

  const primaryNav = $("#navbar > .navbar-nav-list").first();
  if (!primaryNav.length) {
    navigation.push({ page: route, issue: "Primary navigation is missing" });
  } else {
    const primaryItems = primaryNav.children("li").toArray();
    const activeItems = primaryItems.filter((item) => $(item).hasClass("active"));
    const expectedOwner = navigationOwner(siteContent.navigation || [], route);
    if (!expectedOwner && activeItems.length) {
      navigation.push({ page: route, issue: "Primary navigation should not have an active item" });
    }
    if (expectedOwner) {
      const expectedItem = primaryItems.find(
        (item) => normalizeRoute(toLocalPath($(item).children("a").attr("href"), page) || "") === normalizeRoute(expectedOwner.href),
      );
      if (!expectedItem || activeItems.length !== 1 || activeItems[0] !== expectedItem) {
        navigation.push({ page: route, issue: `Incorrect active primary navigation; expected ${expectedOwner.label}` });
      }
    }
  }

  $("[data-tritonai-nav-dropdown]").each((_, element) => {
    const trigger = $(element);
    const controls = trigger.attr("aria-controls");
    if (
      trigger.attr("aria-haspopup") !== "true" ||
      !["true", "false"].includes(trigger.attr("aria-expanded")) ||
      !controls ||
      ids.get(controls) !== 1
    ) {
      navigation.push({ page: route, issue: "Desktop dropdown is missing a valid ARIA relationship" });
    }
  });
  const mobileToggle = $("[data-tritonai-mobile-toggle]");
  if (
    mobileToggle.length !== 1 ||
    mobileToggle.attr("aria-controls") !== "mobile-navigation" ||
    !["true", "false"].includes(mobileToggle.attr("aria-expanded")) ||
    ids.get("mobile-navigation") !== 1
  ) {
    navigation.push({ page: route, issue: "Mobile navigation toggle is missing a valid ARIA relationship" });
  }
  const searchToggle = $("[data-tritonai-search-toggle]");
  if (
    searchToggle.length !== 1 ||
    !["true", "false"].includes(searchToggle.attr("aria-expanded")) ||
    ids.get(searchToggle.attr("aria-controls")) !== 1
  ) {
    navigation.push({ page: route, issue: "Desktop search toggle is missing a valid ARIA relationship" });
  }

  const expectedTwoColumnLayout = (generatedPaths.has(route) && !landingHubPaths.has(route)) || route === "/search/index.html";
  if (expectedTwoColumnLayout) {
    const mainSection = $("main#main-content .main-section").first();
    const sidebar = $("main#main-content .sidebar-section").first();
    if (!mainSection.length || !sidebar.length) {
      navigation.push({ page: route, issue: "Expected main content and sidebar sections" });
    } else {
      for (const requiredClass of ["col-xs-9", "main-section", "pull-right"]) {
        if (!mainSection.hasClass(requiredClass)) navigation.push({ page: route, issue: `Main section is missing ${requiredClass}` });
      }
      for (const requiredClass of ["col-xs-12", "col-md-3", "sidebar-section"]) {
        if (!sidebar.hasClass(requiredClass)) navigation.push({ page: route, issue: `Sidebar is missing ${requiredClass}` });
      }
      const contentOrder = $("main#main-content .main-section, main#main-content .sidebar-section").toArray();
      if (contentOrder.indexOf(mainSection.get(0)) > contentOrder.indexOf(sidebar.get(0))) {
        navigation.push({ page: route, issue: "Sidebar precedes main content in DOM order" });
      }

      const owner = navigationOwner(siteContent.navigation || [], route);
      const sidebarNavigation = sidebar.find(".main-content-nav").first();
      if (owner && sidebarNavigation.length) {
        const sidebarItems = sidebarNavigation.children("ul.navbar-list").children("li").toArray();
        const children = sidebarChildren(owner);
        const activeChild = children.find((child) => child.href === route);
        const sidebarHref = (element) => normalizeRoute(toLocalPath($(element).attr("href"), page) || "");

        if (activeChild) {
          const heading = sidebarNavigation.children("h2").first();
          const headingLink = heading.children("a").first();
          if (
            headingLink.length !== 1 ||
            headingLink.text().trim() !== owner.label ||
            sidebarHref(headingLink) !== normalizeRoute(owner.href)
          ) {
            navigation.push({ page: route, issue: `Sidebar child page must link its heading to ${owner.label}` });
          }
          if (sidebarItems.length !== children.length) {
            navigation.push({ page: route, issue: "Sidebar child page must show only sibling entries" });
          }
          for (const [index, child] of children.entries()) {
            const item = $(sidebarItems[index]);
            if (!item.length) continue;
            const directLink = item.children("a").first();
            if (child.href === route) {
              if (!item.hasClass("active") || directLink.length || item.text().trim() !== child.label) {
                navigation.push({ page: route, issue: `Sidebar current child must be plain active text: ${child.label}` });
              }
            } else if (item.hasClass("active") || directLink.length !== 1 || sidebarHref(directLink) !== normalizeRoute(child.href)) {
              navigation.push({ page: route, issue: `Sidebar sibling link is incorrect: ${child.label}` });
            }
          }
        } else if (route === owner.href) {
          const headingLink = sidebarNavigation.children("h2").children("a").first();
          if (headingLink.length !== 1 || headingLink.text().trim() !== "TritonAI" || sidebarHref(headingLink) !== "/") {
            navigation.push({ page: route, issue: "Sidebar section landing must link its heading to TritonAI home" });
          }
          if (sidebarItems.length !== (siteContent.navigation || []).length) {
            navigation.push({ page: route, issue: "Sidebar section landing must show the root navigation" });
          }
          for (const [index, itemDefinition] of (siteContent.navigation || []).entries()) {
            const item = $(sidebarItems[index]);
            if (!item.length) continue;
            const directLink = item.children("a").first();
            if (itemDefinition === owner) {
              const expectedClass = children.length ? "expanded" : "active";
              if (!item.hasClass("active") || (children.length && !item.hasClass(expectedClass)) || directLink.length) {
                navigation.push({ page: route, issue: `Sidebar section landing must render ${owner.label} as plain active text` });
              }
              const nestedItems = item.children("ul").children("li").toArray();
              if (nestedItems.length !== children.length) {
                navigation.push({ page: route, issue: `Sidebar section landing has incorrect ${owner.label} children` });
              }
              for (const [childIndex, child] of children.entries()) {
                const nestedLink = $(nestedItems[childIndex]).children("a").first();
                if (nestedLink.length !== 1 || sidebarHref(nestedLink) !== normalizeRoute(child.href)) {
                  navigation.push({ page: route, issue: `Sidebar section child link is incorrect: ${child.label}` });
                }
              }
            } else if (!item.hasClass("collapsed") || directLink.length !== 1 || sidebarHref(directLink) !== normalizeRoute(itemDefinition.href)) {
              navigation.push({ page: route, issue: `Sidebar root link is incorrect: ${itemDefinition.label}` });
            }
          }
        }
      }
    }
  } else if (landingHubPaths.has(route)) {
    const mainSection = $("main#main-content .main-section").first();
    if (!mainSection.length || !mainSection.hasClass("col-xs-12")) {
      navigation.push({ page: route, issue: "Landing hub must use a full-width main section" });
    }
    if ($("main#main-content .sidebar-section").length) {
      navigation.push({ page: route, issue: "Landing hub must not render a sidebar" });
    }
  }
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
    const source = image.attr("src") || "";
    const optimizedSource = image.attr("data-src") || (/\.webp(?:$|[?#])/i.test(source) ? source : null) || image.parent("picture").find("source[type='image/webp']").attr("srcset");
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
    if (SITE_BASE_PATH) {
      for (const url of urls) {
        if (url.startsWith("/") && !url.startsWith(`/${SITE_BASE_PATH}/`)) {
          missing.push({ page: route, attribute: "style", target: url, issue: "Inline background URL is missing the site base path" });
        }
      }
    }
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
    const multipleHeroSlides = (homeHeroContent.slides || []).length > 1;
    if ($("#heroslider").length !== 1) accessibility.push({ page: route, issue: "Homepage hero rotator is missing" });
    if ($("#heroslider .item").length !== (homeHeroContent.slides || []).length) {
      contentFindings.push({ source: route, issue: `Rendered hero slide count does not match content (${$("#heroslider .item").length} vs ${(homeHeroContent.slides || []).length})` });
    }
    if ($("#heroslider h1").length || $("#heroslider .hero-slide-heading").length !== (homeHeroContent.slides || []).length) {
      accessibility.push({ page: route, issue: "Homepage carousel must use one h2 heading per slide and no h1 headings" });
    }
    if ($("h1").length !== 1 || !$("#home-feature-heading").is("h1")) {
      accessibility.push({ page: route, issue: "Homepage must have exactly one h1 in the feature section" });
    }
    if ($("#heroslider [data-module='hero-homepage']").first().text().trim() !== homeHeroContent.slides?.[0]?.linkLabel) {
      contentFindings.push({ source: route, issue: "Homepage hero CTA does not match structured content" });
    }
    if (multipleHeroSlides && $("[data-home-hero-toggle]").length !== 1) accessibility.push({ page: route, issue: "Homepage hero pause control is missing" });
    if (!multipleHeroSlides && $("[data-home-hero-toggle], #heroslider .carousel-control").length) accessibility.push({ page: route, issue: "Single-slide homepage hero must not render carousel controls" });
    const inactiveHeroImages = $("#heroslider .item:not(.active) img.first-slide");
    if (multipleHeroSlides && (!inactiveHeroImages.length || inactiveHeroImages.filter("[data-src$='.webp']").length !== inactiveHeroImages.length)) {
      performance.push({ page: route, issue: "Inactive hero images must use deferred optimized sources" });
    }
    if ($("[data-today-news]").length !== 1 || $("[data-today-news-cards]").length !== 1 || $("[data-today-news-status]").length !== 1) {
      contentFindings.push({ source: route, issue: "Today@UCSD news module is missing required hooks" });
    }
    if ($("script[src$='/_resources/js/today-news.js'][defer]").length !== 1) {
      performance.push({ page: route, issue: "Today@UCSD lazy loader is missing or not deferred" });
    }
    if ($("[data-home-subscribe]").length !== 1 || $("[data-home-subscribe] .btn-primary").length !== 1) {
      contentFindings.push({ source: route, issue: "Homepage subscription CTA is missing" });
    }
    if (/background-image/i.test($(".home-feature").attr("style") || "")) {
      performance.push({ page: route, issue: "Homepage feature background must be managed by responsive CSS" });
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
    navigationFailures: navigation.length,
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
  navigation,
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
  navigation.length ||
  metadata.length ||
  routeFindings.length ||
  performance.length
) {
  process.stderr.write("Validation failed. See reports/validation.json.\n");
  process.exit(1);
} else {
  process.stdout.write("Validation passed.\n");
}

import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const SOURCE_DIR = path.resolve("src/site");
const CONTENT_DIR = path.resolve("content");
const PAGE_DIR = path.join(CONTENT_DIR, "pages");
const USE_CASE_DIR = path.join(CONTENT_DIR, "use-cases");
const NEWSLETTER_DIR = path.join(CONTENT_DIR, "newsletters");
const SKILLS_FILE = path.join(CONTENT_DIR, "skills/library.json");
const HOME_HERO_FILE = path.join(CONTENT_DIR, "home/hero.json");
const OUTPUT_DIR = path.resolve("dist");
const OFFICIAL_ORIGIN = "https://tritonai.ucsd.edu";
const SITE_BASE_PATH = normalizeBasePath(process.env.SITE_BASE_PATH || "");
const AFTER_RENDER_SCRIPTS = new Set([
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/modernizr.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/jquery.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/bootstrap.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/vendor.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/decorator.js",
  "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.runtime.min.js",
  "https://cdn.ucsd.edu/cms/search/js/templates.js",
  "https://cdn.ucsd.edu/cms/search/js/search-api.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/datatables.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/datatables-loader.js",
]);
const EMERGENCY_BROADCAST_SCRIPT = "https://www.ucsd.edu/common/_emergency-broadcast/message.js";
const TRITONGPT_WIDGET_SCRIPT = "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js";
const PRECONNECT_ORIGINS = ["https://cdn.ucsd.edu", "https://www.ucsd.edu", "https://tritongpt-deck.vercel.app"];

function normalizeBasePath(value) {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function asDate(value) {
  if (value instanceof Date) return value;
  return new Date(`${value}T12:00:00Z`);
}

function isoDate(value) {
  const date = asDate(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function requireFields(object, fields, source) {
  const missing = fields.filter((field) => object[field] === undefined || object[field] === null || object[field] === "");
  if (missing.length) throw new Error(`${source} is missing required fields: ${missing.join(", ")}`);
}

const markdown = new MarkdownIt({ html: true, linkify: false, typographer: true });
const defaultLinkOpen =
  markdown.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const href = tokens[index].attrGet("href") || "";
  if (/^https?:\/\//i.test(href)) {
    tokens[index].attrSet("target", "_blank");
    tokens[index].attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, index, options, env, self);
};

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function loadMarkdownDirectory(directory, requiredFields) {
  const filenames = (await readdir(directory)).filter((name) => name.endsWith(".md")).sort();
  const entries = [];
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(directory, filename), "utf8"));
    requireFields(parsed.data, requiredFields, path.relative(process.cwd(), path.join(directory, filename)));
    parsed.data.lastReviewed = isoDate(parsed.data.lastReviewed);
    entries.push({ filename, ...parsed.data, body: parsed.content, html: markdown.render(parsed.content) });
  }
  return entries;
}

async function loadNewsletters() {
  const filenames = (await readdir(NEWSLETTER_DIR)).filter((name) => name.endsWith(".md"));
  const newsletters = [];
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(NEWSLETTER_DIR, filename), "utf8"));
    requireFields(parsed.data, ["title", "date"], `content/newsletters/${filename}`);
    const date = asDate(parsed.data.date);
    if (Number.isNaN(date.valueOf())) throw new Error(`Invalid newsletter date in ${filename}`);
    newsletters.push({
      filename,
      title: parsed.data.title,
      date,
      source: parsed.data.source || filename,
      items: Number(parsed.data.items || 0),
      html: markdown.render(parsed.content),
    });
  }
  newsletters.sort((a, b) => b.date - a.date);
  return newsletters;
}

function renderNewsletter(newsletter) {
  const plural = newsletter.items === 1 ? "item" : "items";
  const dateId = newsletter.date.toISOString().slice(0, 10);
  return `<article class="panel panel-default agent-newsletter" id="${dateId}"><div class="panel-heading"><h2>${escapeHtml(newsletter.title)}</h2><p>${newsletter.items} ${plural}</p></div><div class="panel-body">${newsletter.html}</div></article>`;
}

function renderLatestNewsletters(newsletters) {
  if (!newsletters.length) return '<div class="alert alert-info">No AI updates are available yet.</div>';
  const [latest, ...recent] = newsletters.slice(0, 3);
  const $latest = load(latest.html, { decodeEntities: false });
  const topics = [];
  $latest("h2, h3").each((_, element) => {
    const topic = $latest(element).text().trim();
    if (topic && !/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i.test(topic) && !topics.includes(topic) && topics.length < 3) topics.push(topic);
  });
  const firstTopicHeading = $latest("h3").first();
  const firstStory = firstTopicHeading.nextAll("p, li").first().text().trim() || $latest("li, p").first().text().trim();
  const excerpt = firstStory
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280)
    .replace(/\s+\S*$/, "");
  const dateId = latest.date.toISOString().slice(0, 10);
  const topicBadges = topics.map((topic) => `<span class="label label-default">${escapeHtml(topic)}</span>`).join(" ");
  const recentCards = recent
    .map(
      (newsletter) =>
        `<div class="col-sm-6"><article class="panel panel-default home-update-card"><div class="panel-body"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span><p class="home-kicker">Recent update</p><h3>${escapeHtml(newsletter.title)}</h3><p>${newsletter.items} ${newsletter.items === 1 ? "item" : "items"} covering campus AI tools, training, and news.</p><a href="/about/ai-updates.html#${escapeHtml(newsletter.date.toISOString().slice(0, 10))}">Read this update <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></div></article></div>`,
    )
    .join("");
  return `<article class="panel panel-default home-latest-update"><div class="panel-heading"><div><p class="home-kicker">Newest briefing</p><h3>${escapeHtml(latest.title)}</h3></div><span class="home-update-count">${latest.items} ${latest.items === 1 ? "item" : "items"}</span></div><div class="panel-body"><p class="home-update-topics">${topicBadges}</p><p>${escapeHtml(excerpt)}${excerpt ? "…" : ""}</p><p><a class="btn btn-primary" href="/about/ai-updates.html#${dateId}">Read the latest update</a></p></div></article>${recentCards ? `<div class="row agent-card-grid home-recent-updates">${recentCards}</div>` : ""}`;
}

function statusClass(status) {
  if (status === "Shipped" || status === "Production") return "agent-status-shipped";
  if (status === "Pilot") return "agent-status-pilot";
  if (status === "In development") return "agent-status-development";
  return "agent-status-exploring";
}

function renderStatus(status) {
  return `<span class="agent-status ${statusClass(status)}">${escapeHtml(status)}</span>`;
}

function renderUseCaseCards(useCases) {
  return `<div class="row agent-card-grid">${useCases
    .map(
      (useCase) =>
        `<div class="col-sm-6 col-md-4"><article class="panel panel-default agent-card"><div class="panel-body">${renderStatus(useCase.status)}<h2 class="h3"><a href="${escapeHtml(useCase.canonicalUrl)}">${escapeHtml(useCase.title)}</a></h2><p>${escapeHtml(useCase.summary)}</p><p><strong>Measure:</strong> ${escapeHtml(useCase.measurableOutcome)}</p></div></article></div>`,
    )
    .join("")}</div>`;
}

function renderUseCasePage(useCase) {
  return `<p class="lead">${escapeHtml(useCase.summary)}</p>${renderStatus(useCase.status)}<dl class="agent-meta"><dt>Service owner</dt><dd>${escapeHtml(useCase.owner)}</dd><dt>Human oversight</dt><dd>${escapeHtml(useCase.humanOversight)}</dd><dt>Measurement plan</dt><dd>${escapeHtml(useCase.measurableOutcome)}</dd><dt>Measurement period</dt><dd>${escapeHtml(useCase.measurementPeriod)}</dd><dt>Data boundary</dt><dd>${escapeHtml(useCase.dataClassification)}</dd><dt>Last reviewed</dt><dd>${escapeHtml(useCase.lastReviewed)}</dd></dl>${useCase.html}<p><a class="btn btn-default" href="/use-cases/index.html">Back to all use cases</a></p>`;
}

function renderRoadmap(roadmap) {
  return `<p class="lead">${escapeHtml(roadmap.description)}</p><div class="alert alert-info"><strong>Status key:</strong> Shipped is publicly available; Pilot is being tested with bounded users and oversight; In development is active work without a committed launch date; Exploring is discovery, not a delivery commitment.</div>${roadmap.items
    .map(
      (item) =>
        `<article class="agent-roadmap-item">${renderStatus(item.status)}<h2>${escapeHtml(item.period)}: ${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p><p><small><strong>Owner:</strong> ${escapeHtml(item.owner)} · <strong>Last reviewed:</strong> ${escapeHtml(item.lastReviewed)}</small></p></article>`,
    )
    .join("")}<p><a class="btn btn-primary" href="/use-cases/index.html">Explore current use cases</a></p>`;
}

function renderPublicFacts(facts) {
  return `<div class="panel panel-default"><div class="panel-heading"><h2 class="panel-title">Current public facts</h2></div><div class="panel-body"><ul>${facts
    .filter((fact) => fact.status === "public")
    .map((fact) => `<li>${escapeHtml(fact.claim)} <small>(Reviewed ${escapeHtml(fact.lastReviewed)})</small></li>`)
    .join("")}</ul></div></div>`;
}

function renderHomeHero(hero) {
  const indicators = hero.slides
    .map(
      (_, index) =>
        `<li aria-hidden="true" class="${index === 0 ? "active" : ""}" data-slide-to="${index}" data-target="#heroslider"></li>`,
    )
    .join("");
  const slides = hero.slides
    .map((slide, index) => {
      const accent = slide.accent ? `<br><span>${escapeHtml(slide.accent)}</span>` : "";
      const imageSource = slide.optimizedImage || slide.image;
      const imageAttributes =
        index === 0
          ? `src="${escapeHtml(imageSource)}" fetchpriority="high"`
          : `src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${escapeHtml(imageSource)}" loading="lazy"`;
      const fallback = slide.optimizedImage ? ` data-fallback-src="${escapeHtml(slide.image)}"` : "";
      return `<div aria-label="${index + 1} out of ${hero.slides.length}" aria-roledescription="slide" aria-hidden="${index === 0 ? "false" : "true"}" class="item${index === 0 ? " active" : ""}" role="group"><img alt="${escapeHtml(slide.imageAlt)}" class="first-slide" ${imageAttributes}${fallback} decoding="async"><div class="container"><div class="cr-item-container"><div class="row"><div class="col-sm-12"><div class="animated fadeInUp herotextbg-dark-opaque"><h1 class="rt-text-light" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.title)}${accent}</h1><p class="rt-text-light" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.description)}</p><a class="btn btn-lg btn-default" data-module="hero-homepage" href="${escapeHtml(slide.link)}" role="button" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.linkLabel)}</a></div></div></div></div></div></div>`;
    })
    .join("");
  return `<div class="carousel slide jumbotron jumbotron-hero hm" data-interval="${hero.rotationIntervalMs}" data-ride="carousel" id="heroslider"><div aria-label="Revolving Banners with ${hero.slides.length} items" class="carousel-inner" role="region" tabindex="0"><div id="indicators-container"><button aria-label="carousel is playing, click to pause" data-home-hero-toggle id="toggleCarousel" type="button"><span aria-hidden="true" class="glyphicon glyphicon-pause"></span></button><ol aria-hidden="true" class="carousel-indicators">${indicators}</ol></div>${slides}<a aria-controls="heroslider" aria-label="previous slide" class="left carousel-control" data-home-hero-direction="prev" data-slide="prev" href="#heroslider" role="button" tabindex="0"><span aria-hidden="true" class="glyphicon glyphicon-chevron-left"></span><span class="sr-only">Previous</span></a><a aria-controls="heroslider" aria-label="next slide" class="right carousel-control" data-home-hero-direction="next" data-slide="next" href="#heroslider" role="button" tabindex="0"><span aria-hidden="true" class="glyphicon glyphicon-chevron-right"></span><span class="sr-only">Next</span></a></div></div><script defer src="/_resources/js/home-hero.js"></script>`;
}

function renderSkillsLibrary(library) {
  const collectionOptions = library.collections
    .map((collection) => `<option value="${escapeHtml(collection.id)}">${escapeHtml(collection.label)} (${collection.count})</option>`)
    .join("");
  const cards = library.skills
    .map((skill) => {
      const resourceParts = Object.entries(skill.resources)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${count} ${type}`);
      const searchable = `${skill.name} ${skill.description} ${skill.collectionLabel} ${skill.maintainer || ""}`.toLowerCase();
      return `<div class="col-sm-6" data-skill-card data-skill-collection="${escapeHtml(skill.collection)}" data-skill-search="${escapeHtml(searchable)}"><article class="panel panel-default agent-card skills-card"><div class="panel-heading"><span class="skills-collection">${escapeHtml(skill.collectionLabel)}</span><h2 class="panel-title">${escapeHtml(skill.name)}</h2></div><div class="panel-body"><p>${escapeHtml(skill.description)}</p>${skill.maintainer ? `<p><strong>Maintainer:</strong> ${escapeHtml(skill.maintainer)}</p>` : ""}<p><strong>Supporting files:</strong> ${resourceParts.length ? escapeHtml(resourceParts.join(" · ")) : "None"}</p><details class="skills-details"><summary>Technical details</summary><p class="skills-path"><code>${escapeHtml(skill.directory)}</code></p></details></div><div class="panel-footer"><a class="btn btn-primary" href="${escapeHtml(skill.sourceUrl)}">View SKILL.md</a> <a class="btn btn-default" href="${escapeHtml(skill.directoryUrl)}">Browse files</a></div></article></div>`;
    })
    .join("");
  return `<div data-skills-catalog><div class="row skills-summary" aria-label="Skills Library summary"><div class="col-sm-4"><div class="skills-summary-item"><span class="glyphicon glyphicon-book" aria-hidden="true"></span><strong>${library.skills.length}</strong><span>public skills</span></div></div><div class="col-sm-4"><div class="skills-summary-item"><span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span><strong>${library.collections.length}</strong><span>collections</span></div></div><div class="col-sm-4"><div class="skills-summary-item"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span><strong>Hourly</strong><span>automatic sync</span></div></div></div><div class="alert alert-info skills-sync-notice"><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span><div><p><strong>Automatically synchronized from <a href="${escapeHtml(library.source.url)}">${escapeHtml(library.source.repository)}</a>.</strong></p><p>Showing ${library.skills.length} public skills at source commit <a href="${escapeHtml(library.source.commitUrl)}"><code>${escapeHtml(library.source.commitSha.slice(0, 12))}</code></a>, committed ${escapeHtml(library.source.commitDate.slice(0, 10))}. The catalog refreshes hourly and can also respond to a repository dispatch event.</p></div></div><div class="skills-section-heading"><p class="home-kicker">Reusable agent capabilities</p><h2>Browse skills</h2></div><form class="skills-filter" role="search" aria-label="Filter skills" onsubmit="return false"><div class="row"><div class="col-sm-7"><label for="skills-search">Search by skill name or purpose</label><div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></span><input class="form-control" id="skills-search" type="search" autocomplete="off" data-skills-search></div></div><div class="col-sm-5"><label for="skills-collection">Collection</label><select class="form-control" id="skills-collection" data-skills-collection><option value="">All collections (${library.skills.length})</option>${collectionOptions}</select></div></div><p class="skills-status" data-skills-status aria-live="polite"></p></form><div class="row agent-card-grid skills-grid">${cards}</div><div class="panel panel-default skills-install"><div class="panel-heading"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span><h2 class="panel-title">Install a skill</h2></div><div class="panel-body"><p>Clone the source repository, then copy an individual skill directory—not its <code>tritonai/</code> or <code>community/</code> wrapper—into the skills directory used by your agent.</p><pre><code>git clone https://github.com/${escapeHtml(library.source.repository)}.git
mkdir -p ~/.agents/skills
cp -R UCSD-Skills-Library/tritonai/skill-name ~/.agents/skills/</code></pre><p>Review the skill and its supporting files before installation. The public library excludes restricted operational procedures and credentials.</p><p><a class="btn btn-default" href="${escapeHtml(library.source.url)}#installing-a-skill">Read the repository instructions</a></p></div></div></div>`;
}

function renderNavigation(items, route, mobile = false) {
  const section = route.split("/").filter(Boolean)[0] || "";
  return items
    .map((item) => {
      const targetSection = item.href.split("/").filter(Boolean)[0] || "";
      const active = route === item.href || (targetSection && targetSection === section);
      const current = route === item.href ? ' aria-current="page"' : "";
      if (!item.items?.length) {
        return `<li class="${active ? "active" : ""}"><a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)}</a></li>`;
      }
      const submenu = item.items
        .map((child) => {
          const childCurrent = route === child.href ? ' aria-current="page"' : "";
          return `<li${route === child.href ? ' class="active"' : ""}><a href="${escapeHtml(child.href)}"${childCurrent}>${escapeHtml(child.label)}</a></li>`;
        })
        .join("");
      if (mobile) {
        return `<li class="dropdown open ${active ? "active" : ""}"><a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)} <span class="caret"></span></a><ul class="dropdown-menu navmenu-nav">${submenu}</ul></li>`;
      }
      return `<li class="dropdown ${active ? "active" : ""}"><a aria-expanded="false" class="dropdown-toggle" data-close-others="true" data-hover="dropdown" href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)} <span class="caret"></span></a><ul class="dropdown-menu">${submenu}</ul></li>`;
    })
    .join("");
}

function routeForRelativePath(relativePath) {
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replaceAll(path.sep, "/")}`;
}

function relativePathForRoute(route) {
  if (route === "/") return "index.html";
  return route.replace(/^\//, "");
}

function breadcrumbFor(page) {
  const pieces = page.path.split("/").filter(Boolean);
  if (pieces.length <= 1) return "";
  if (pieces.at(-1) === "index.html") {
    return `<li><a href="/">TritonAI</a></li><li aria-current="page">${escapeHtml(page.title)}</li>`;
  }
  const section = pieces[0];
  const sectionLabels = {
    about: "About",
    "developer-apis": "Build",
    tritongpt: "TritonGPT",
    "training-resources": "Learn",
    "use-cases": "Use Cases",
    skills: "Skills Library",
  };
  const sectionHref = section === "use-cases" ? "/use-cases/index.html" : `/${section}/index.html`;
  return `<li><a href="/">TritonAI</a></li><li><a href="${sectionHref}">${escapeHtml(sectionLabels[section] || section)}</a></li><li aria-current="page">${escapeHtml(page.title)}</li>`;
}

function renderGeneratedPage(shellHtml, page, bodyHtml, homeHero) {
  const $ = load(shellHtml, { decodeEntities: false });
  $("body").addClass("agent-page");
  const mainContent =
    page.path === "/index.html"
      ? `${renderHomeHero(homeHero)}<div class="container home-main-content"><section aria-label="Main Content" class="col-xs-12 main-section">${bodyHtml}</section></div>`
      : `<div class="jumbotron jumbotron-fluid intro-banner" style="background-image:url(https://cdn.ucsd.edu/cms/decorator-5/img/blue-grit.jpg);"><div class="container"><div class="cr-item-container hr-banner-two-col"><div class="row"><div class="col-sm-12"><div class="text-indent text-indent-h1 animated fadeInUp"><h1 class="intro-banner-heading">${escapeHtml(page.title)}</h1></div></div></div></div></div></div><div class="container"><div class="row"><ol aria-label="Breadcrumb" class="breadcrumb breadcrumbs-list">${breadcrumbFor(page)}</ol></div><div class="row"><section aria-label="Main Content" class="col-xs-12 main-section">${bodyHtml}</section></div></div>`;
  $("main#main-content").html(mainContent);
  return $.html();
}

function decodeCloudflareEmail(value) {
  if (!value || value.length < 4) return null;
  const key = Number.parseInt(value.slice(0, 2), 16);
  let result = "";
  for (let index = 2; index < value.length; index += 2) {
    result += String.fromCharCode(Number.parseInt(value.slice(index, index + 2), 16) ^ key);
  }
  return result;
}

function prefixInternalUrl(value, relativePath) {
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:|about:|blob:)/i.test(value) || value.startsWith("//")) return value;
  let candidate = value;
  try {
    const parsed = new URL(value, OFFICIAL_ORIGIN);
    if (/^https?:\/\//i.test(value) && parsed.origin !== OFFICIAL_ORIGIN) return value;
    if (/^https?:\/\//i.test(value) && parsed.origin === OFFICIAL_ORIGIN) {
      candidate = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return value;
  }
  if (SITE_BASE_PATH && !candidate.startsWith("/")) {
    try {
      const resolved = new URL(candidate, `https://local.invalid/${relativePath}`);
      candidate = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      return value;
    }
  }
  if (!candidate.startsWith("/") || !SITE_BASE_PATH) return candidate;
  if (candidate === SITE_BASE_PATH || candidate.startsWith(`${SITE_BASE_PATH}/`)) return candidate;
  return `${SITE_BASE_PATH}${candidate}`;
}

function upsertMeta($, selector, attributes) {
  let element = $(selector).first();
  if (!element.length) {
    element = $("<meta>");
    $("head").append(element);
  }
  element.attr(attributes);
}

function localAssetPath(value, relativePath) {
  if (!value || /^(?:data:|https?:|\/\/|#)/i.test(value)) return null;
  try {
    return new URL(value, `https://local.invalid/${relativePath}`).pathname;
  } catch {
    return null;
  }
}

function optimizedImageFor(value, relativePath, optimizedImages) {
  const localPath = localAssetPath(value, relativePath);
  if (!localPath || !/\.(?:jpe?g|png)$/i.test(localPath)) return null;
  const optimizedPath = localPath.replace(/\.(?:jpe?g|png)$/i, ".webp");
  if (!optimizedImages.has(optimizedPath)) return null;
  return value.replace(/\.(?:jpe?g|png)(?=$|[?#])/i, ".webp");
}

function optimizeLocalImages($, relativePath, optimizedImages) {
  $("img[src]").each((_, element) => {
    const image = $(element);
    if (image.hasClass("first-slide") || image.parent("picture").length) return;
    const source = image.attr("src");
    const optimized = optimizedImageFor(source, relativePath, optimizedImages);
    if (!optimized) return;
    image.attr("loading", "lazy").attr("decoding", "async");
    image.wrap('<picture class="tritonai-optimized-image"></picture>');
    image.before(`<source srcset="${escapeHtml(optimized)}" type="image/webp">`);
  });

  $("[style*='background-image']").each((_, element) => {
    const target = $(element);
    const style = target.attr("style") || "";
    const match = style.match(/background-image\s*:\s*url\((['\"]?)([^'\")]+)\1\)\s*;?/i);
    if (!match) return;
    const optimized = optimizedImageFor(match[2], relativePath, optimizedImages);
    if (!optimized) return;
    const fallbackDeclaration = `background-image:url('${match[2]}');`;
    const fallbackType = /\.png(?:$|[?#])/i.test(match[2]) ? "png" : "jpeg";
    const optimizedDeclaration = `background-image:image-set(url('${optimized}') type('image/webp'), url('${match[2]}') type('image/${fallbackType}'));`;
    target.attr("style", style.replace(match[0], `${fallbackDeclaration}${optimizedDeclaration}`));
  });
}

function optimizeScriptLoading($) {
  $("script[src]").each((_, element) => {
    const script = $(element);
    const source = script.attr("src") || "";
    if (AFTER_RENDER_SCRIPTS.has(source) || /(?:^|\/)datatables\.min\.js(?:[?#]|$)/i.test(source)) {
      script.attr("data-after-render-src", source).attr("type", "application/x-tritonai-after-render-script").removeAttr("src");
    } else if (source === EMERGENCY_BROADCAST_SCRIPT) {
      script.attr("async", "");
    } else if (source === TRITONGPT_WIDGET_SCRIPT) {
      script.attr("data-idle-src", source).attr("type", "application/x-tritonai-idle-script").removeAttr("src");
    }
  });

  $("script:not([src])").each((_, element) => {
    const script = $(element);
    if (script.attr("type") && script.attr("type") !== "text/javascript") return;
    const source = script.html() || "";
    if (!/\$\(document\)\.ready|initCopyright\(\)/.test(source)) return;
    const guardedSource = source
      .replace("$('.js-activated').dropdownHover().dropdown();", "if (window.jQuery && jQuery.fn.dropdownHover && jQuery.fn.dropdown) $('.js-activated').dropdownHover().dropdown();")
      .replace("initCopyright();", "if (typeof initCopyright === 'function') initCopyright();");
    script.attr("type", "application/x-tritonai-after-render-inline");
    script.html(`if (window.jQuery) {\n${guardedSource}\n}`);
  });
}

function transformHtml(html, relativePath, context) {
  const $ = load(html, { decodeEntities: false });
  const route = routeForRelativePath(relativePath);
  const generated = context.generatedByPath.get(relativePath);
  const title = generated?.title || $("meta[name='PAGETITLE']").attr("content") || $("title").text().trim() || context.site.name;
  const description = generated?.description || $("meta[name='DESCRIPTION']").attr("content") || context.site.description;
  const canonicalPath = generated?.canonicalUrl || route;
  const canonicalUrl = new URL(canonicalPath, OFFICIAL_ORIGIN).href;

  $("title").text(title === context.site.name ? title : `${title} | ${context.site.name}`);
  upsertMeta($, "meta[name='description'], meta[name='DESCRIPTION']", { name: "description", content: description });
  upsertMeta($, "meta[name='PAGETITLE']", { name: "PAGETITLE", content: title });
  upsertMeta($, "meta[property='og:title']", { property: "og:title", content: title });
  upsertMeta($, "meta[property='og:description']", { property: "og:description", content: description });
  upsertMeta($, "meta[property='og:type']", { property: "og:type", content: "website" });
  upsertMeta($, "meta[property='og:url']", { property: "og:url", content: canonicalUrl });
  upsertMeta($, "meta[name='twitter:card']", { name: "twitter:card", content: "summary" });
  if (relativePath === "404.html") upsertMeta($, "meta[name='robots']", { name: "robots", content: "noindex,follow" });
  $("link[rel='canonical']").remove();
  $("head").append(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
  if (!$("link[rel~='icon']").length) $("head").append('<link rel="icon" href="https://www.ucsd.edu/favicon.ico">');
  if (!$("link[href$='agent-site.css']").length) $("head").append('<link rel="stylesheet" href="/_resources/css/agent-site.css">');
  const connectionHints = PRECONNECT_ORIGINS.map(
    (origin) => `<link rel="preconnect" href="${origin}" crossorigin><link rel="dns-prefetch" href="//${new URL(origin).host}">`,
  ).join("");
  $("head").prepend(`${connectionHints}<script data-tritonai-js-class>document.documentElement.className=document.documentElement.className.replace(/\\bno-js\\b/g,'js');</script>`);
  $("script[data-tritonai-schema]").remove();
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": relativePath === "index.html" ? "WebSite" : "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    isPartOf: { "@type": "WebSite", name: context.site.name, url: OFFICIAL_ORIGIN },
    dateModified: generated?.lastReviewed || context.site.lastReviewed,
  }).replaceAll("</script", "<\\/script");
  $("head").append(`<script type="application/ld+json" data-tritonai-schema>${schema}</script>`);

  $(".navbar-nav-list").first().html(renderNavigation(context.site.navigation, route, false));
  $("ul.nav.navmenu-nav").first().html(renderNavigation(context.site.navigation, route, true));

  $("[data-newsletters='latest']").html(renderLatestNewsletters(context.newsletters));
  $("[data-newsletters='all']").html(context.newsletters.map(renderNewsletter).join(""));
  const legacyNewsletterContainer = $(".space-y-12.md\\:space-y-14").first();
  if (legacyNewsletterContainer.length) legacyNewsletterContainer.html(context.newsletters.map(renderNewsletter).join(""));
  $("[data-featured-use-cases='true']").html(renderUseCaseCards(context.useCases.filter((entry) => entry.featured)));
  $("[data-public-facts='true']").html(renderPublicFacts(context.facts.facts));
  $("[data-skills-library='true']").html(renderSkillsLibrary(context.skills));

  $("video").each((_, element) => {
    const video = $(element);
    video
      .removeAttr("autoplay")
      .attr("data-autoplay-when-visible", "true")
      .attr("preload", "none")
      .attr("muted", "muted")
      .attr("playsinline", "playsinline");
    if (video.attr("poster")) video.attr("data-poster", video.attr("poster")).removeAttr("poster");
    if (video.attr("src")) video.attr("data-src", video.attr("src")).removeAttr("src");
    video.find("source[src]").each((__, sourceElement) => {
      const source = $(sourceElement);
      source.attr("data-src", source.attr("src")).removeAttr("src");
    });
  });
  $("iframe[src*='youtube.com/embed']").each((_, element) => {
    const iframe = $(element);
    const url = new URL(iframe.attr("src"));
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("mute", "1");
    url.searchParams.set("playsinline", "1");
    iframe
      .attr("data-src", url.href)
      .attr("src", "about:blank")
      .attr("loading", "lazy")
      .attr("data-autoplay-when-visible", "true");
  });

  optimizeLocalImages($, relativePath, context.optimizedImages);
  optimizeScriptLoading($);
  if (!$("script[src$='site-performance.js']").length) $("body").append('<script defer src="/_resources/js/site-performance.js"></script>');

  $("a[href^='/cdn-cgi/l/email-protection#']").each((_, element) => {
    const anchor = $(element);
    const email = decodeCloudflareEmail((anchor.attr("href") || "").split("#")[1]);
    if (!email) return;
    anchor.attr("href", `mailto:${email}`).removeAttr("target").removeAttr("rel");
    if (/email\s*protected/i.test(anchor.text())) anchor.text(email);
  });
  $("span.__cf_email__").each((_, element) => {
    const span = $(element);
    const email = decodeCloudflareEmail(span.attr("data-cfemail"));
    if (!email) return;
    const anchor = span.closest("a");
    if (anchor.length) anchor.attr("href", `mailto:${email}`).removeAttr("target").removeAttr("rel");
    span.replaceWith(email);
  });

  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const href = anchor.attr("href") || "";
    if (/^https?:\/\//i.test(href) && new URL(href).origin !== OFFICIAL_ORIGIN) {
      anchor.attr("target", "_blank").attr("rel", "noopener noreferrer");
    }
  });

  for (const attr of ["href", "src", "action", "poster", "data-src", "data-poster", "data-fallback-src", "data-after-render-src", "data-idle-src"]) {
    $(`[${attr}]`).each((_, element) => {
      if (attr === "href" && element.tagName === "link" && $(element).attr("rel") === "canonical") return;
      $(element).attr(attr, prefixInternalUrl($(element).attr(attr), relativePath));
    });
  }
  $("[srcset]").each((_, element) => {
    const rewritten = ($(element).attr("srcset") || "")
      .split(",")
      .map((candidate) => {
        const parts = candidate.trim().split(/\s+/);
        parts[0] = prefixInternalUrl(parts[0], relativePath);
        return parts.join(" ");
      })
      .join(", ");
    $(element).attr("srcset", rewritten);
  });

  if (relativePath === "search/index.html") {
    const searchScript = $("script[data-after-render-src='https://cdn.ucsd.edu/cms/search/js/search-api.js']").first();
    if (searchScript.length) {
      searchScript.after("<script>/* Keep staging searches scoped to the production TritonAI index. */\ndocument.addEventListener('tritonai:decorator-ready', function () { if (typeof search === 'function') { const tritonAiSearch = search; search = function(data, back) { if (data && data.siteSearch && data.siteSearch !== 'tritonai.ucsd.edu') data.siteSearch = 'tritonai.ucsd.edu'; return tritonAiSearch(data, back); }; } }, { once: true });\n</script>");
    }
  }

  return $.html();
}

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

async function writeGeneratedPage(shellHtml, page, bodyHtml, generatedByPath, homeHero) {
  const relativePath = relativePathForRoute(page.path);
  const filename = path.join(OUTPUT_DIR, relativePath);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, renderGeneratedPage(shellHtml, page, bodyHtml, homeHero));
  generatedByPath.set(relativePath, page);
}

const site = await readJson(path.join(CONTENT_DIR, "site.json"));
const roadmap = await readJson(path.join(CONTENT_DIR, "roadmap/milestones.json"));
const facts = await readJson(path.join(CONTENT_DIR, "facts/public-facts.json"));
const skills = await readJson(SKILLS_FILE);
const homeHero = await readJson(HOME_HERO_FILE);
requireFields(roadmap, ["title", "description", "owner", "lastReviewed", "source", "canonicalUrl", "items"], "content/roadmap/milestones.json");
roadmap.lastReviewed = isoDate(roadmap.lastReviewed);
for (const [index, item] of roadmap.items.entries()) {
  requireFields(item, ["period", "title", "status", "summary", "owner", "lastReviewed", "source"], `roadmap item ${index + 1}`);
  item.lastReviewed = isoDate(item.lastReviewed);
}
for (const fact of facts.facts) {
  requireFields(fact, ["id", "claim", "status", "owner", "lastReviewed", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides"], `public fact ${fact.id || "unknown"}`);
  fact.lastReviewed = isoDate(fact.lastReviewed);
}
requireFields(skills, ["schemaVersion", "syncedAt", "source", "collections", "skills"], "content/skills/library.json");
requireFields(skills.source, ["repository", "url", "defaultBranch", "commitSha", "commitUrl", "commitDate"], "content/skills/library.json source");
for (const [index, skill] of skills.skills.entries()) {
  requireFields(skill, ["name", "description", "collection", "collectionLabel", "path", "directory", "sourceUrl", "directoryUrl", "resources"], `skill ${index + 1}`);
}
requireFields(homeHero, ["schemaVersion", "owner", "source", "lastReviewed", "rotationIntervalMs", "slides"], "content/home/hero.json");
homeHero.lastReviewed = isoDate(homeHero.lastReviewed);
for (const [index, slide] of homeHero.slides.entries()) {
  requireFields(slide, ["id", "title", "description", "image", "imageAlt", "link", "linkLabel"], `homepage hero slide ${index + 1}`);
}

const pages = await loadMarkdownDirectory(PAGE_DIR, ["title", "path", "description", "lastReviewed", "audiences", "source", "canonicalUrl", "relatedSlides"]);
const useCases = await loadMarkdownDirectory(USE_CASE_DIR, ["title", "slug", "summary", "status", "owner", "lastReviewed", "audiences", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides", "humanOversight", "measurableOutcome"]);
const newsletters = await loadNewsletters();
const shellHtml = await readFile(path.join(SOURCE_DIR, "about/index.html"), "utf8");
const homeShellHtml = await readFile(path.join(SOURCE_DIR, "index.html"), "utf8");

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });
await cp(SOURCE_DIR, OUTPUT_DIR, { recursive: true });

const generatedByPath = new Map();
for (const page of pages) {
  await writeGeneratedPage(page.path === "/index.html" ? homeShellHtml : shellHtml, page, page.html, generatedByPath, homeHero);
}

const useCaseIndex = {
  title: "AI Use Cases",
  path: "/use-cases/index.html",
  description: "Public, status-based descriptions of TritonAI workflow solutions and their human-oversight and measurement plans.",
  eyebrow: "TritonAI portfolio",
  lastReviewed: site.lastReviewed,
  canonicalUrl: "/use-cases/index.html",
};
await writeGeneratedPage(shellHtml, useCaseIndex, `<p class="lead">Explore how TritonAI applies shared AI capabilities to specific campus problems. Status labels distinguish available services, bounded pilots, active development, and early discovery.</p>${renderUseCaseCards(useCases)}`, generatedByPath, homeHero);
for (const useCase of useCases) {
  await writeGeneratedPage(
    shellHtml,
    { ...useCase, path: useCase.canonicalUrl, eyebrow: "AI use case", description: useCase.summary },
    renderUseCasePage(useCase),
    generatedByPath,
  );
}

await writeGeneratedPage(shellHtml, { ...roadmap, path: roadmap.canonicalUrl, eyebrow: "About TritonAI" }, renderRoadmap(roadmap), generatedByPath);
await writeGeneratedPage(
  shellHtml,
  {
    title: "Page Not Found",
    path: "/404.html",
    description: "The requested TritonAI page could not be found.",
    eyebrow: "404",
    lastReviewed: site.lastReviewed,
    canonicalUrl: "/404.html",
  },
  '<p class="lead">The page may have moved, or the address may be incomplete.</p><p><a class="btn btn-primary" href="/">Return to TritonAI</a> <a class="btn btn-default" href="/search/index.html">Search the site</a></p>',
  generatedByPath,
);

let htmlFiles = (await listFiles(OUTPUT_DIR)).filter((file) => file.endsWith(".html"));
const optimizedImages = new Set(
  (await listFiles(path.join(SOURCE_DIR, "_images")))
    .filter((file) => file.endsWith(".webp"))
    .map((file) => `/_images/${file.replaceAll(path.sep, "/")}`),
);
const context = { site, newsletters, useCases, facts, skills, generatedByPath, optimizedImages };
for (const relativePath of htmlFiles) {
  const filename = path.join(OUTPUT_DIR, relativePath);
  await writeFile(filename, transformHtml(await readFile(filename, "utf8"), relativePath, context));
}

htmlFiles = (await listFiles(OUTPUT_DIR)).filter((file) => file.endsWith(".html")).sort();
const routes = htmlFiles.map((relativePath) => ({
  path: routeForRelativePath(relativePath),
  canonicalUrl: new URL(generatedByPath.get(relativePath)?.canonicalUrl || routeForRelativePath(relativePath), OFFICIAL_ORIGIN).href,
  source: generatedByPath.has(relativePath) ? "structured-content" : "cascade-snapshot",
  lastReviewed: generatedByPath.get(relativePath)?.lastReviewed || site.lastReviewed,
}));
const sitemapEntries = routes
  .filter((route) => route.path !== "/404.html")
  .map((route) => `<url><loc>${escapeHtml(route.canonicalUrl)}</loc><lastmod>${escapeHtml(route.lastReviewed)}</lastmod></url>`)
  .join("");
await mkdir(path.join(OUTPUT_DIR, "_data"), { recursive: true });
await writeFile(path.join(OUTPUT_DIR, "_data/routes.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`);
await writeFile(
  path.join(OUTPUT_DIR, "_data/public-content.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      lastReviewed: site.lastReviewed,
      facts: facts.facts.filter((fact) => fact.status === "public"),
      roadmap,
      useCases: useCases.map(({ html, body, filename, ...entry }) => entry),
      skillsLibrary: skills,
      homeHero,
    },
    null,
    2,
  )}\n`,
);
await writeFile(path.join(OUTPUT_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>\n`);
await writeFile(path.join(OUTPUT_DIR, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${OFFICIAL_ORIGIN}/sitemap.xml\n`);
await writeFile(path.join(OUTPUT_DIR, ".nojekyll"), "");

process.stdout.write(`Built ${htmlFiles.length} HTML files, ${useCases.length} structured use cases, ${skills.skills.length} public skills, and ${newsletters.length} newsletters for base path ${SITE_BASE_PATH || "/"}.\n`);

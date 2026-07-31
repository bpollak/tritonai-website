import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Shared helpers for the media article archive. The JSON file
// content/media/articles.json is the source of truth; this module renders it
// into the HTML that lives inside content/pages/about-media-articles.md and
// lets the sync job add newly discovered coverage without hand-editing markup.

export const ARTICLES_JSON = path.resolve("content/media/articles.json");
export const ARTICLES_MARKDOWN = path.resolve("content/pages/about-media-articles.md");

export const SECTION_START = "<!-- AGENT_SECTION: media-articles -->";
export const SECTION_END = "<!-- END_AGENT_SECTION -->";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function normalizeUrl(value) {
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return null;
  // Drop tracking-style query params and fragments so the same article from
  // different referrers dedupes to one entry.
  for (const key of [...parsed.searchParams.keys()]) {
    if (/^(utm_|ref|source|mc_|_hsenc|_hsmi|fbclid|gclid|reflink)/i.test(key)) {
      parsed.searchParams.delete(key);
    }
  }
  parsed.hash = "";
  let href = parsed.href;
  if (href.endsWith("/")) href = href.slice(0, -1);
  return href;
}

export function existingUrls(data) {
  const urls = new Set();
  for (const section of data.sections) {
    for (const article of section.articles) {
      const normalized = normalizeUrl(article.url);
      if (normalized) urls.add(normalized);
    }
  }
  return urls;
}

export function isValidArticle(article) {
  return (
    article &&
    typeof article.url === "string" &&
    typeof article.title === "string" && article.title.trim() &&
    typeof article.source === "string" && article.source.trim() &&
    typeof article.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(article.date)
  );
}

function articleYear(article) {
  return Number.parseInt(article.date.slice(0, 4), 10);
}

function sortSections(data) {
  data.sections.sort((a, b) => b.year - a.year);
  for (const section of data.sections) {
    section.articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }
  return data;
}

// Insert an article into the matching year section, creating the section when
// needed. Returns true if added, false if a duplicate URL was already present.
export function addArticle(data, article) {
  if (!isValidArticle(article)) return false;
  const normalized = normalizeUrl(article.url);
  if (!normalized) return false;
  if (existingUrls(data).has(normalized)) return false;
  article.url = normalized;

  const year = articleYear(article);
  let section = data.sections.find((entry) => entry.year === year);
  if (!section) {
    section = {
      year,
      heading: String(year),
      description: "Coverage discovered by the automated media search and awaiting editorial grouping.",
      articles: [],
    };
    data.sections.push(section);
  }
  section.articles.push(article);
  sortSections(data);
  return true;
}

export function renderArticle(article) {
  const date = new Date(`${article.date}T12:00:00Z`);
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `<article><div class="media-article-date"><span>${escapeHtml(month)}</span><strong>${escapeHtml(String(day))}</strong></div><div><p class="media-article-source">${escapeHtml(article.source)}</p><h3><a href="${escapeHtml(article.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(article.title)}</a></h3><span class="media-article-kind">${escapeHtml(article.kind)}</span></div></article>`;
}

export function renderSection(section) {
  const id = `articles-${section.year}-heading`;
  const items = section.articles.map(renderArticle).join("");
  return `<section class="media-article-section" aria-labelledby="${escapeHtml(id)}">
<div class="media-year-heading"><span>${escapeHtml(String(section.year))}</span><div><h2 id="${escapeHtml(id)}">${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.description)}</p></div></div>
<div class="media-article-list">
${items}
</div>
</section>`;
}

export function renderArticleSections(data) {
  return data.sections.map(renderSection).join("\n\n");
}

// Replace the generated region of the article archive markdown with rendered sections.
export function rewriteMarkdown(markdown, sectionsHtml) {
  return rewriteRegion(markdown, SECTION_START, SECTION_END, sectionsHtml, ARTICLES_MARKDOWN);
}

export async function loadArticles() {
  return JSON.parse(await readFile(ARTICLES_JSON, "utf8"));
}

export async function saveArticles(data) {
  await writeFile(ARTICLES_JSON, `${JSON.stringify(data, null, 2)}\n`);
}

export async function renderAndWriteMarkdown(data) {
  const markdown = await readFile(ARTICLES_MARKDOWN, "utf8");
  await writeFile(ARTICLES_MARKDOWN, rewriteMarkdown(markdown, renderArticleSections(data)));
}

// --- Media landing page (about-media.md) -----------------------------------

export const MEDIA_MARKDOWN = path.resolve("content/pages/about-media.md");
export const MEDIA_SECTION_START = "<!-- AGENT_SECTION: media-latest -->";
export const MEDIA_SECTION_END = "<!-- END_AGENT_SECTION -->";

export function allArticlesSorted(data) {
  return data.sections
    .flatMap((section) => section.articles)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Compact entry card for the media landing page, reusing the media-entry style.
export function renderMediaEntry(article) {
  const date = new Date(`${article.date}T12:00:00Z`);
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `<a class="media-entry" href="${escapeHtml(article.url)}" rel="noopener noreferrer" target="_blank"><span class="glyphicon glyphicon-file" aria-hidden="true"></span><div><span class="media-entry-meta">${escapeHtml(article.source)} · ${escapeHtml(formatted)}</span><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.kind)}</p></div></a>`;
}

export function renderLatestCoverage(data, limit = 6) {
  const latest = allArticlesSorted(data).slice(0, limit);
  const entries = latest.map(renderMediaEntry).join("\n");
  return `<section class="landing-section media-latest" aria-labelledby="media-latest-heading">
<div class="container">
<div class="landing-section-heading"><p class="home-kicker">Written coverage</p><h2 id="media-latest-heading">Latest coverage</h2><p>Recent reporting and case studies about TritonAI and TritonGPT. Browse the full archive by year.</p></div>
<div class="media-entry-grid">
${entries}
</div>
<p><a class="btn btn-primary" href="/about/media-articles.html">View articles and coverage</a></p>
</div>
</section>`;
}

function rewriteRegion(markdown, startMarker, endMarker, html, sourceLabel) {
  const start = markdown.indexOf(startMarker);
  const end = markdown.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Media markers not found in ${sourceLabel}`);
  }
  const before = markdown.slice(0, start + startMarker.length);
  const after = markdown.slice(end);
  return `${before}\n${html}\n${after}`;
}

export function rewriteMediaMarkdown(markdown, latestHtml) {
  return rewriteRegion(markdown, MEDIA_SECTION_START, MEDIA_SECTION_END, latestHtml, MEDIA_MARKDOWN);
}

export async function renderAndWriteAll(data) {
  const articlesMd = await readFile(ARTICLES_MARKDOWN, "utf8");
  await writeFile(ARTICLES_MARKDOWN, rewriteRegion(articlesMd, SECTION_START, SECTION_END, renderArticleSections(data), ARTICLES_MARKDOWN));
  const mediaMd = await readFile(MEDIA_MARKDOWN, "utf8");
  await writeFile(MEDIA_MARKDOWN, rewriteMediaMarkdown(mediaMd, renderLatestCoverage(data)));
}

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import {
  ARTICLES_JSON,
  addArticle,
  existingUrls,
  loadArticles,
  normalizeUrl,
  renderAndWriteAll,
  saveArticles,
} from "./lib/media-articles.mjs";

// Searches the public web for coverage of TritonAI / TritonGPT and appends new
// articles to content/media/articles.json, then re-renders the article archive
// section of content/pages/about-media-articles.md from that JSON.
//
// Search backend: DuckDuckGo Lite HTML results (no API key required).
//
// The job never deletes curated entries. New entries are tagged with
// discoveredAt / discoveredVia so a reviewer can see what the search added
// before merging the pull request the workflow opens.

const USER_AGENT = "TritonAI-Website-Media-Sync/1.0 (+https://tritonai.ucsd.edu)";
const FETCH_TIMEOUT = 20_000;
const SITE_ORIGIN = "https://tritonai.ucsd.edu";

// Base domains that are not independent coverage and should never be
// auto-added. Subdomains are blocked too (e.g. sg.linkedin.com). First-party
// ucsd.edu pages are excluded from automated discovery; campus stories are
// curated by hand in content/media/articles.json instead.
const BLOCKED_DOMAINS = [
  "tritonai.ucsd.edu",
  "ucsd.edu",
  "brettcpollak.com",
  "github.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "tiktok.com",
  "pinterest.com",
  "wikipedia.org",
];

function isBlockedHost(host) {
  if (!host) return true;
  host = host.toLowerCase();
  return BLOCKED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

// A result counts as relevant if its title or snippet mentions TritonGPT or
// TritonAI, or UC San Diego alongside AI.
const RELEVANCE = /(triton ?gpt|tritonai|triton ai)\b/i;
const UCSD_AI = /(uc\s*san\s*diego|ucsd)\b[^]{0,60}\b(ai|artificial intelligence|chatbot|gpt|llm)\b/i;

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((argument) => argument.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function publisherFromHost(host) {
  if (!host) return "Unknown source";
  const bare = host.replace(/^www\./, "");
  const labels = bare.split(".");
  const base = labels.length > 2 ? labels[labels.length - 2] : labels[0];
  // Tidy a few common higher-ed / news publisher names.
  const map = {
    ucsd: "UC San Diego",
    dailycal: "The Daily Californian",
    ucsdguardian: "The UCSD Guardian",
    govtech: "GovTech",
    edtechmagazine: "EdTech Magazine",
    bestcolleges: "BestColleges",
    sciencesprings: "ScienceSprings",
    sandiegoreader: "San Diego Reader",
    ideascale: "IdeaScale",
    internet2: "Internet2",
    uctechnews: "UC Tech News",
    substack: "Substack",
    cio: "CIO.com",
    forbes: "Forbes",
  };
  return map[base] || bare;
}

function titleCaseKind(value) {
  return String(value || "Coverage").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchText(url, { asBrowser = false } = {}) {
  const response = await fetch(url, {
    headers: asBrowser
      ? { "User-Agent": "Mozilla/5.0", Accept: "text/html" }
      : { Accept: "text/html,application/json", "User-Agent": USER_AGENT },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!response.ok) throw new Error(`Request to ${url} returned HTTP ${response.status}`);
  return response.text();
}

// --- DuckDuckGo Lite (no key) ----------------------------------------------

function decodeDuckDuckGoHref(href) {
  if (!href) return null;
  const absolute = href.startsWith("//") ? `https:${href}` : href;
  try {
    const parsed = new URL(absolute, "https://lite.duckduckgo.com/");
    if (parsed.hostname === "duckduckgo.com" && parsed.pathname === "/l/") {
      const target = parsed.searchParams.get("uddg");
      if (target) return target;
    }
    return absolute;
  } catch {
    return null;
  }
}

async function searchDuckDuckGo(queries) {
  const results = [];
  for (const query of queries) {
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}&kl=us-en`;
    const html = await fetchText(url, { asBrowser: true });
    const $ = load(html);
    // DuckDuckGo Lite renders each result as a row with an a.result-link whose
    // href is a redirect through duckduckgo.com/l/?uddg=<encoded target>.
    $("a.result-link").each((_, element) => {
      const link = $(element);
      const title = link.text().trim();
      const href = decodeDuckDuckGoHref(link.attr("href"));
      const row = link.closest("tr");
      const snippet = row.find("td.result-snippet").first().text().trim();
      if (title && href && /^https?:\/\//i.test(href)) {
        results.push({ title, url: href, snippet });
      }
    });
  }
  return results;
}

async function search(queries) {
  return searchDuckDuckGo(queries);
}

// --- Date extraction from the article page ---------------------------------

function parseDate(value) {
  if (!value) return null;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
  return null;
}

async function extractArticleMeta(url) {
  let html;
  try {
    html = await fetchText(url, { asBrowser: true });
  } catch {
    return {};
  }
  const $ = load(html);
  const jsonLd = $('script[type="application/ld+json"]').first().text();
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd);
      const node = Array.isArray(data) ? data[0] : data;
      const published = node?.datePublished || node?.dateCreated || node?.datePosted;
      if (published) {
        const date = parseDate(published);
        if (date) return { date };
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  const ogPublished = $('meta[property="article:published_time"]').attr("content")
    || $('meta[property="og:article:published_time"]').attr("content")
    || $('meta[name="date"]').attr("content")
    || $('meta[name="publish_date"]').attr("content")
    || $('meta[itemprop="datePublished"]').attr("content")
    || $("time[datetime]").first().attr("datetime");
  const date = parseDate(ogPublished);
  if (date) return { date };
  // Last resort: a YYYY/MM/DD pattern in the URL path.
  const urlMatch = url.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  if (urlMatch) {
    const [, year, month, day] = urlMatch;
    return { date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` };
  }
  return {};
}

function isRelevant(result) {
  const text = `${result.title}\n${result.snippet}`;
  if (isBlockedHost(hostnameOf(result.url))) return false;
  if (RELEVANCE.test(text)) return true;
  if (UCSD_AI.test(text)) return true;
  return false;
}

function defaultDate() {
  return new Date().toISOString().slice(0, 10);
}

async function discover(data, queries, { searchFn = search, fetchMeta = extractArticleMeta } = {}) {
  const known = existingUrls(data);
  const results = (await searchFn(queries)).filter(isRelevant);
  const added = [];
  for (const result of results) {
    const url = normalizeUrl(result.url);
    if (!url || known.has(url)) continue;
    const meta = await fetchMeta(url);
    const article = {
      date: meta.date || defaultDate(),
      source: publisherFromHost(hostnameOf(url)),
      title: result.title.replace(/\s+/g, " ").trim(),
      url,
      kind: "Coverage",
      discoveredAt: new Date().toISOString(),
      discoveredVia: "duckduckgo",
    };
    if (addArticle(data, article)) {
      known.add(url);
      added.push(article);
    }
  }
  return added;
}

async function main() {
  const checkOnly = hasFlag("check");
  const data = await loadArticles();
  const queries = data.queries && data.queries.length ? data.queries : ["TritonGPT UC San Diego", "TritonAI UC San Diego"];
  const added = await discover(data, queries);

  if (!added.length) {
    process.stdout.write("No new media coverage found.\n");
    return;
  }

  data.lastReviewed = new Date().toISOString().slice(0, 10);
  const summary = added.map((article) => `- ${article.date} · ${article.source} · ${article.title} — ${article.url}`);
  if (checkOnly) {
    process.stdout.write(`Found ${added.length} new article(s) pending review:\n${summary.join("\n")}\n`);
    process.exitCode = 1;
    return;
  }

  await saveArticles(data);
  await renderAndWriteAll(data);
  process.stdout.write(`Added ${added.length} new article(s) and re-rendered the archive:\n${summary.join("\n")}\n`);
}
export { discover, isRelevant, publisherFromHost };

const isMain = import.meta.url === pathToFileURL(process.argv[1] || "").href;
if (isMain) await main();

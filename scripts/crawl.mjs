import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const ORIGIN = "https://tritonai.ucsd.edu";
const OUTPUT_DIR = path.resolve("src/site");
const REPORT_DIR = path.resolve("reports");
const MAX_URLS = 5000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; TritonAIStaticMigration/1.0; +https://github.com/bpollak/tritonai-website)";

const queue = [];
const queued = new Set();
const fetched = new Set();
const records = [];
const discoveredFrom = new Map();

function normalizeUrl(candidate, base = ORIGIN) {
  if (!candidate || /^(?:mailto|tel|javascript|data):/i.test(candidate)) return null;
  try {
    const url = new URL(candidate, base);
    if (url.origin !== ORIGIN) return null;
    if (url.pathname.startsWith("/cdn-cgi/")) return null;
    url.hash = "";
    // Static files cannot represent query-specific responses. The current site
    // uses queries only for search/filter state, so preserve the route itself.
    url.search = "";
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return url.href;
  } catch {
    return null;
  }
}

function enqueue(candidate, from) {
  const normalized = normalizeUrl(candidate, from || ORIGIN);
  if (!normalized || queued.has(normalized) || fetched.has(normalized)) return;
  if (queued.size + fetched.size >= MAX_URLS) {
    throw new Error(`Crawl exceeded safety limit of ${MAX_URLS} URLs`);
  }
  queued.add(normalized);
  queue.push(normalized);
  if (from) discoveredFrom.set(normalized, from);
}

function extractCssUrls(css) {
  const urls = [];
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (match[2]) urls.push(match[2]);
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/gi)) {
    if (match[1]) urls.push(match[1]);
  }
  return urls;
}

function discoverHtml(html, pageUrl) {
  const $ = load(html, { decodeEntities: false });
  const attrs = ["href", "src", "action", "poster", "data-src"];
  for (const attr of attrs) {
    $(`[${attr}]`).each((_, element) => enqueue($(element).attr(attr), pageUrl));
  }
  $("[srcset]").each((_, element) => {
    const srcset = $(element).attr("srcset") || "";
    for (const candidate of srcset.split(",")) enqueue(candidate.trim().split(/\s+/)[0], pageUrl);
  });
  $("[style]").each((_, element) => {
    for (const candidate of extractCssUrls($(element).attr("style") || "")) {
      enqueue(candidate, pageUrl);
    }
  });
  $("style").each((_, element) => {
    for (const candidate of extractCssUrls($(element).html() || "")) enqueue(candidate, pageUrl);
  });
}

function outputPath(url, contentType) {
  const { pathname } = new URL(url);
  let decodedPath = decodeURIComponent(pathname);
  if (decodedPath === "/") return path.join(OUTPUT_DIR, "index.html");
  if (decodedPath.endsWith("/")) decodedPath += "index.html";
  const extension = path.posix.extname(decodedPath);
  if (!extension && contentType.includes("text/html")) decodedPath += "/index.html";
  return path.join(OUTPUT_DIR, decodedPath.replace(/^\//, ""));
}

async function fetchOne(url) {
  queued.delete(url);
  fetched.add(url);
  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
  } catch (error) {
    records.push({ url, status: "FETCH_ERROR", error: error.message, from: discoveredFrom.get(url) });
    return;
  }

  const finalUrl = normalizeUrl(response.url) || url;
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const record = {
    url,
    finalUrl,
    status: response.status,
    contentType,
    from: discoveredFrom.get(url),
  };
  records.push(record);

  if (!response.ok) return;
  const buffer = Buffer.from(await response.arrayBuffer());
  const destination = outputPath(finalUrl, contentType);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer);
  record.output = path.relative(process.cwd(), destination);
  record.bytes = buffer.length;

  if (contentType.includes("text/html")) {
    discoverHtml(buffer.toString("utf8"), finalUrl);
  } else if (contentType.includes("text/css")) {
    for (const candidate of extractCssUrls(buffer.toString("utf8"))) enqueue(candidate, finalUrl);
  } else if (contentType.includes("xml") || finalUrl.endsWith(".xml")) {
    const text = buffer.toString("utf8");
    for (const match of text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) enqueue(match[1], finalUrl);
  }
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await rm(REPORT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });
await mkdir(REPORT_DIR, { recursive: true });

enqueue(`${ORIGIN}/`);
enqueue(`${ORIGIN}/sitemap.xml`);
enqueue(`${ORIGIN}/robots.txt`);

while (queue.length) {
  const batch = queue.splice(0, 8);
  await Promise.all(batch.map(fetchOne));
  if (fetched.size % 50 < batch.length) {
    process.stdout.write(`Fetched ${fetched.size} URLs; ${queue.length} queued\n`);
  }
}

records.sort((a, b) => a.url.localeCompare(b.url));
const htmlPages = records.filter((record) => record.status === 200 && record.contentType.includes("text/html"));
const failures = records.filter((record) => record.status !== 200);
await writeFile(
  path.join(REPORT_DIR, "crawl.json"),
  `${JSON.stringify(
    {
      origin: ORIGIN,
      crawledAt: new Date().toISOString(),
      counts: { total: records.length, htmlPages: htmlPages.length, failures: failures.length },
      records,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  `Crawl complete: ${records.length} URLs, ${htmlPages.length} HTML pages, ${failures.length} non-200 responses.\n`,
);
if (failures.length) {
  process.stdout.write("Non-200 responses are recorded in reports/crawl.json.\n");
}

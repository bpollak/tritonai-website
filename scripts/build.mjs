import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const SOURCE_DIR = path.resolve("src/site");
const NEWSLETTER_DIR = path.resolve("content/newsletters");
const OUTPUT_DIR = path.resolve("dist");
const OFFICIAL_ORIGIN = "https://tritonai.ucsd.edu";
const SITE_BASE_PATH = normalizeBasePath(process.env.SITE_BASE_PATH || "");
const NEWSLETTER_BODY_CLASS =
  "max-w-none text-slate-700 [&_p]:text-[1.06rem] [&_p]:leading-9 [&_p]:my-5 [&_p]:text-slate-700 [&_ul]:my-6 [&_ul]:pl-0 [&_ul>li]:list-none [&_ul>li]:pl-5 [&_ul>li]:mb-8 [&_ul>li]:border-l-2 [&_ul>li]:border-slate-100 [&_ul>li]:text-[1.06rem] [&_ul>li]:leading-9 [&_ul>li]:text-slate-700 [&_strong]:text-slate-900 [&_strong]:font-bold [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:pb-3 [&_h2]:border-b-2 [&_h2]:border-blue-900/20 [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-[0.18em] [&_h3]:text-slate-500 [&_h3]:font-semibold [&_h3]:mt-16 [&_h3]:mb-5 [&_h3]:pb-2 [&_h3]:border-b [&_h3]:border-slate-200 [&_hr]:border-slate-200 [&_hr]:my-10 [&_a]:font-semibold [&_a]:text-blue-800 [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:decoration-blue-600 [&_a]:transition-colors [&_a:hover]:text-blue-950 [&_a:hover]:decoration-blue-900 [&_em]:text-slate-500 [&_em]:text-[0.95rem]";

function normalizeBasePath(value) {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const markdown = new MarkdownIt({ html: true, linkify: false, typographer: false });
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

async function loadNewsletters() {
  const filenames = (await readdir(NEWSLETTER_DIR)).filter((name) => name.endsWith(".md"));
  const newsletters = [];
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(NEWSLETTER_DIR, filename), "utf8"));
    const date =
      parsed.data.date instanceof Date
        ? parsed.data.date
        : new Date(`${parsed.data.date}T12:00:00Z`);
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
  return `<article class="editorial-panel overflow-hidden"><div class="px-8 py-6 border-b border-white/10 editorial-dark"><div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h2 class="text-2xl font-semibold text-white">${escapeHtml(newsletter.title)}</h2><p class="text-blue-100 text-sm mt-1">Source: ${escapeHtml(newsletter.source)}</p></div><div class="inline-flex w-fit items-center bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/15">${newsletter.items} ${plural}</div></div></div><div class="px-8 py-7"><div class="${escapeHtml(NEWSLETTER_BODY_CLASS)}">${newsletter.html}</div></div></article>`;
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

function prefixInternalUrl(value) {
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(value) || value.startsWith("//")) return value;
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
  if (!candidate.startsWith("/") || !SITE_BASE_PATH) return candidate;
  if (candidate === SITE_BASE_PATH || candidate.startsWith(`${SITE_BASE_PATH}/`)) return candidate;
  return `${SITE_BASE_PATH}${candidate}`;
}

function transformHtml(html, relativePath, newsletterMarkup) {
  const $ = load(html, { decodeEntities: false });
  const container = $(".space-y-12.md\\:space-y-14").first();
  if (container.length) container.html(newsletterMarkup);

  $("a[href^='/cdn-cgi/l/email-protection#']").each((_, element) => {
    const anchor = $(element);
    const encoded = (anchor.attr("href") || "").split("#")[1];
    const email = decodeCloudflareEmail(encoded);
    if (!email) return;
    anchor.attr("href", `mailto:${email}`);
    anchor.removeAttr("target");
    anchor.removeAttr("rel");
    if (/email\s*protected/i.test(anchor.text())) anchor.text(email);
  });

  $("span.__cf_email__").each((_, element) => {
    const span = $(element);
    const email = decodeCloudflareEmail(span.attr("data-cfemail"));
    if (!email) return;
    const anchor = span.closest("a");
    if (anchor.length) {
      anchor.attr("href", `mailto:${email}`);
      anchor.removeAttr("target");
      anchor.removeAttr("rel");
    }
    span.replaceWith(email);
  });

  const attrs = ["href", "src", "action", "poster", "data-src"];
  for (const attr of attrs) {
    $(`[${attr}]`).each((_, element) => {
      const current = $(element).attr(attr);
      $(element).attr(attr, prefixInternalUrl(current));
    });
  }
  $("[srcset]").each((_, element) => {
    const rewritten = ($(element).attr("srcset") || "")
      .split(",")
      .map((candidate) => {
        const parts = candidate.trim().split(/\s+/);
        parts[0] = prefixInternalUrl(parts[0]);
        return parts.join(" ");
      })
      .join(", ");
    $(element).attr("srcset", rewritten);
  });

  if (relativePath === "search/index.html") {
    const searchScript = $("script[src='https://cdn.ucsd.edu/cms/search/js/search-api.js']").first();
    if (searchScript.length) {
      searchScript.after(
        "<script>/* Keep staging searches scoped to the production TritonAI index. */\n" +
          "if (typeof search === 'function') { const tritonAiSearch = search; search = function(data, back) { if (data && data.siteSearch && data.siteSearch !== 'tritonai.ucsd.edu') data.siteSearch = 'tritonai.ucsd.edu'; return tritonAiSearch(data, back); }; }\n" +
          "</script>",
      );
    }
  }

  return $.html();
}

async function listHtmlFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listHtmlFiles(absolute, base)));
    else if (entry.name.endsWith(".html")) files.push(path.relative(base, absolute));
  }
  return files;
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });
await cp(SOURCE_DIR, OUTPUT_DIR, { recursive: true });

const newsletters = await loadNewsletters();
const newsletterMarkup = newsletters.map(renderNewsletter).join("");
const htmlFiles = await listHtmlFiles(OUTPUT_DIR);
for (const relativePath of htmlFiles) {
  const filename = path.join(OUTPUT_DIR, relativePath);
  const transformed = transformHtml(await readFile(filename, "utf8"), relativePath, newsletterMarkup);
  await writeFile(filename, transformed);
}
await writeFile(path.join(OUTPUT_DIR, ".nojekyll"), "");

process.stdout.write(
  `Built ${htmlFiles.length} HTML files with ${newsletters.length} newsletters for base path ${SITE_BASE_PATH || "/"}.\n`,
);

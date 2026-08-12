import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import TurndownService from "turndown";

const DEFAULT_SOURCE_URL = "https://brettcpollak.com/ucsd-ai-news";
const DEFAULT_OUTPUT_DIR = path.resolve("content/newsletters");
const NEWSLETTER_FILENAME = /^ucsd-ai-newsletter-(\d{4}-\d{2}-\d{2})\.md$/;

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((argument) => argument.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function decodeCloudflareEmail(value) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length < 4 || value.length % 2 !== 0) return null;
  const key = Number.parseInt(value.slice(0, 2), 16);
  let decoded = "";
  for (let index = 2; index < value.length; index += 2) {
    decoded += String.fromCharCode(Number.parseInt(value.slice(index, index + 2), 16) ^ key);
  }
  return decoded.includes("@") ? decoded : null;
}

function safeUrl(value, baseUrl) {
  try {
    const parsed = new URL(value, baseUrl);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return null;
    if (
      parsed.hostname === "tritonai.ucsd.edu" &&
      parsed.pathname === "/tritongpt/release-notes/5-1-2026-release.html"
    ) {
      parsed.pathname = "/about/tritonai-updates.html";
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function sanitizeBody($, body, sourceUrl) {
  body.find("script, style, iframe, object, embed, form, input, button").remove();
  body.find("*").each((_, element) => {
    for (const attribute of Object.keys(element.attribs || {})) {
      if (/^on/i.test(attribute)) $(element).removeAttr(attribute);
    }
  });

  body.find("a").each((_, element) => {
    const link = $(element);
    const href = link.attr("href");
    const encodedEmail = link.find("[data-cfemail]").first().attr("data-cfemail");
    const encodedEmailFromHref = href?.match(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/i)?.[1];
    const decodedEmail = decodeCloudflareEmail(encodedEmail || encodedEmailFromHref || "");
    if (decodedEmail) {
      link.attr("href", `mailto:${decodedEmail}`).text(decodedEmail);
      return;
    }

    const normalized = href ? safeUrl(href, sourceUrl) : null;
    if (normalized) {
      link.attr("href", normalized);
    } else {
      link.replaceWith(link.text());
    }
  });

  body.find("img").each((_, element) => {
    const image = $(element);
    const src = image.attr("src");
    const normalized = src ? safeUrl(src, sourceUrl) : null;
    if (normalized) {
      image.attr("src", normalized);
    } else {
      image.remove();
    }
  });
}

async function readSource(sourceUrl, sourceFile) {
  if (sourceFile) return readFile(path.resolve(sourceFile), "utf8");

  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "TritonAI-Website-Newsletter-Sync/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Newsletter source returned HTTP ${response.status}`);

  const finalUrl = new URL(response.url);
  if (finalUrl.protocol !== "https:" || finalUrl.hostname !== "brettcpollak.com") {
    throw new Error(`Newsletter source redirected to an unexpected host: ${finalUrl.hostname}`);
  }
  return response.text();
}

function extractEditions(html, sourceUrl) {
  const $ = load(html, { decodeEntities: false });
  const turndown = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    strongDelimiter: "**",
  });

  turndown.addRule("preserveInlineCode", {
    filter: ["code"],
    replacement(content) {
      return `\`${content}\``;
    },
  });

  const editions = [];
  for (const article of $("article.editorial-panel").toArray()) {
    const item = $(article);
    const title = item.find("> div:first-child h2").first().text().trim();
    const sourceText = item.find("> div:first-child p").first().text().trim();
    const sourceMatch = sourceText.match(/([A-Za-z0-9_-]+\.md)/);
    if (!sourceMatch) continue;

    const filename = sourceMatch[1];
    const filenameMatch = filename.match(NEWSLETTER_FILENAME);
    if (!filenameMatch) throw new Error(`Unexpected newsletter filename: ${filename}`);

    const countText = item.find("> div:first-child > div > div:last-child").text();
    const items = Number.parseInt(countText, 10);
    const body = item.find("> div:nth-child(2) > div").first().clone();
    if (!title || !body.length) throw new Error(`Incomplete newsletter markup for ${filename}`);
    if (!Number.isInteger(items) || items < 1) {
      throw new Error(`Newsletter edition ${filename} reports no items; refusing to synchronize an empty edition`);
    }

    const headings = body.find("h2").map((_, element) => $(element).text().trim()).get();
    if (!headings.includes("What's New in Your AI Tools") || !headings.includes("TritonAI News")) {
      throw new Error(`Required newsletter sections are missing from ${filename}`);
    }

    sanitizeBody($, body, sourceUrl);
    const markdown = turndown.turndown(body.html() || "").trim();
    const frontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `date: ${filenameMatch[1]}`,
      `source: ${JSON.stringify(filename)}`,
      `items: ${items}`,
      "---",
      "",
    ].join("\n");

    editions.push({
      filename,
      content: `${frontmatter}${markdown}\n`,
    });
  }

  if (!editions.length) throw new Error("No newsletter editions were found in the source page");
  return editions;
}

async function main() {
  const sourceUrl = getArg("source-url", DEFAULT_SOURCE_URL);
  const sourceFile = getArg("source-file");
  const outputDir = path.resolve(getArg("output-dir", DEFAULT_OUTPUT_DIR));
  const checkOnly = hasFlag("check");
  const html = await readSource(sourceUrl, sourceFile);
  const editions = extractEditions(html, sourceUrl);
  const changes = [];

  await mkdir(outputDir, { recursive: true });
  for (const edition of editions) {
    const destination = path.join(outputDir, edition.filename);
    let current = null;
    try {
      current = await readFile(destination, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (current === edition.content) continue;
    changes.push(edition.filename);
    if (!checkOnly) await writeFile(destination, edition.content);
  }

  process.stdout.write(
    `${checkOnly ? "Checked" : "Synchronized"} ${editions.length} editions from ${sourceUrl}; ${changes.length} ${checkOnly ? "pending" : "written"}.\n`,
  );
  for (const filename of changes) process.stdout.write(`- ${filename}\n`);
  if (checkOnly && changes.length) process.exitCode = 1;
}

await main();

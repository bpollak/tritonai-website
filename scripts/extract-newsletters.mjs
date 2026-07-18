import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import TurndownService from "turndown";

const sourceFile = path.resolve("src/site/about/ai-updates.html");
const outputDir = path.resolve("content/newsletters");
const html = await readFile(sourceFile, "utf8");
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

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

let extracted = 0;
for (const article of $("article.editorial-panel").toArray()) {
  const item = $(article);
  const title = item.find("> div:first-child h2").first().text().trim();
  const sourceText = item.find("> div:first-child p").first().text().trim();
  const sourceMatch = sourceText.match(/([A-Za-z0-9_-]+\.md)/);
  if (!sourceMatch) throw new Error(`Unable to identify newsletter source for ${title}`);
  const filename = sourceMatch[1];
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) throw new Error(`Unable to identify newsletter date from ${filename}`);
  const countText = item.find("> div:first-child > div > div:last-child").text();
  const items = Number.parseInt(countText, 10);
  const body = item.find("> div:nth-child(2) > div").first();
  const markdown = turndown.turndown(body.html() || "").trim();
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${dateMatch[1]}`,
    `source: ${JSON.stringify(filename)}`,
    `items: ${Number.isFinite(items) ? items : 0}`,
    "---",
    "",
  ].join("\n");
  await writeFile(path.join(outputDir, filename), `${frontmatter}${markdown}\n`);
  extracted += 1;
}

process.stdout.write(`Extracted ${extracted} newsletters to content/newsletters.\n`);

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// The playground is served from a public GitHub Pages URL carrying the same
// content as tritonai.ucsd.edu. Left indexable it competes with production for
// production's own queries, which is the failure this guards.

async function buildInto(basePath) {
  const outDir = await mkdtemp(path.join(tmpdir(), "indexing-"));
  await execFileAsync("node", ["scripts/build.mjs"], {
    cwd: repoRoot,
    env: { ...process.env, SITE_BASE_PATH: basePath, OUTPUT_DIR: outDir },
    maxBuffer: 32 * 1024 * 1024,
  });
  return outDir;
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".html")) out.push(path.join(entry.parentPath ?? entry.path, entry.name));
  }
  return out;
}

const robotsContent = (html) => /<meta[^>]*name="robots"[^>]*>/i.exec(html)?.[0] ?? "";

test("the playground build marks every page noindex", async (t) => {
  const dir = await buildInto("/tritonai-website");
  t.after(() => rm(dir, { recursive: true, force: true }));

  const files = await htmlFiles(dir);
  assert.ok(files.length > 40, `expected a full build, got ${files.length} pages`);

  const indexable = [];
  for (const file of files) {
    const tag = robotsContent(await readFile(file, "utf8"));
    if (!/noindex/i.test(tag)) indexable.push(`${path.relative(dir, file)} -> ${tag || "(no robots meta)"}`);
  }
  assert.deepEqual(indexable, [], `these playground pages could be indexed:\n  ${indexable.join("\n  ")}`);
});

test("the playground still allows crawling, so the noindex can be read", async (t) => {
  const dir = await buildInto("/tritonai-website");
  t.after(() => rm(dir, { recursive: true, force: true }));

  const robots = await readFile(path.join(dir, "robots.txt"), "utf8");
  // `Disallow: /` would stop a crawler fetching the page, and a page it cannot
  // fetch is one whose noindex it cannot read — so the URL can still be listed.
  assert.doesNotMatch(robots, /^\s*Disallow:\s*\/\s*$/mi);
  // Production's sitemap must not be advertised here; it would invite crawling
  // of the very URLs this build keeps separate.
  assert.doesNotMatch(robots, /Sitemap:/i);
});

test("the production build stays indexable and advertises its sitemap", async (t) => {
  const dir = await buildInto("");
  t.after(() => rm(dir, { recursive: true, force: true }));

  const home = await readFile(path.join(dir, "index.html"), "utf8");
  assert.match(robotsContent(home), /index,follow/i);
  assert.doesNotMatch(robotsContent(home), /noindex/i);

  const robots = await readFile(path.join(dir, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/tritonai\.ucsd\.edu\/sitemap\.xml/);
});

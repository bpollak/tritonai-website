import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = path.resolve("scripts/sync-ai-news.mjs");

function runSync(sourceFile, outputDir, ...extra) {
  return spawnSync(
    process.execPath,
    [script, `--source-file=${sourceFile}`, `--output-dir=${outputDir}`, ...extra],
    { encoding: "utf8" },
  );
}

test("syncs validated newsletter markup and sanitizes links", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "tritonai-news-sync-"));
  const sourceFile = path.join(workDir, "source.html");
  const outputDir = path.join(workDir, "newsletters");
  const fixture = `
    <article class="editorial-panel">
      <div><div><div><h2>Monday, July 27</h2><p>Source: ucsd-ai-newsletter-2026-07-27.md</p></div><div>1 item</div></div></div>
      <div><div>
        <h2>What's New in Your AI Tools</h2>
        <h3>TritonGPT</h3>
        <p><a href="/ucsd-ai-news">A campus update</a> is available.</p>
        <p><a href="https://tritonai.ucsd.edu/tritongpt/release-notes/5-1-2026-release.html">Release notes</a></p>
        <p>Contact the <a href="/cdn-cgi/l/email-protection#5c282e352833323d351c293f2f3872393829">TritonAI team</a>.</p>
        <script>alert("unsafe")</script>
        <h2>Coming Up: Trainings &amp; Workshops</h2>
        <p>No upcoming events.</p>
        <h2>TritonAI News</h2>
        <p>No new releases.</p>
      </div></div>
    </article>`;

  try {
    await writeFile(sourceFile, fixture);
    const result = runSync(sourceFile, outputDir);
    assert.equal(result.status, 0, result.stderr);
    const output = await readFile(path.join(outputDir, "ucsd-ai-newsletter-2026-07-27.md"), "utf8");
    assert.match(output, /date: 2026-07-27/);
    assert.match(output, /\[A campus update\]\(https:\/\/brettcpollak\.com\/ucsd-ai-news\)/);
    assert.match(output, /\[Release notes\]\(https:\/\/tritonai\.ucsd\.edu\/tritongpt\/release-notes\/index\.html\)/);
    assert.match(output, /\[tritonai@ucsd\.edu\]\(mailto:tritonai@ucsd\.edu\)/);
    assert.doesNotMatch(output, /unsafe|script/i);

    const check = runSync(sourceFile, outputDir, "--check");
    assert.equal(check.status, 0, check.stderr);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});

test("check mode reports a source edition that has not been synchronized", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "tritonai-news-check-"));
  const sourceFile = path.join(workDir, "source.html");
  const outputDir = path.join(workDir, "newsletters");

  try {
    await writeFile(sourceFile, `
      <article class="editorial-panel">
        <div><div><div><h2>Monday, July 27</h2><p>Source: ucsd-ai-newsletter-2026-07-27.md</p></div><div>0 items</div></div></div>
        <div><div>
          <h2>What's New in Your AI Tools</h2><p>No new updates this week.</p>
          <h2>Coming Up: Trainings &amp; Workshops</h2><p>No upcoming events.</p>
          <h2>TritonAI News</h2><p>No new releases.</p>
        </div></div>
      </article>`);
    const result = runSync(sourceFile, outputDir, "--check");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /ucsd-ai-newsletter-2026-07-27\.md/);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});

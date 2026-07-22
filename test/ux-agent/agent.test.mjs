import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  createFinding,
  extractSection,
  extractSections,
  filterEligibleDrafts,
  loadConfig,
  preservationErrors,
  recipeFits,
  sectionSnapshot,
  unexpectedRecipeClasses,
  validateFinding,
} from "../../scripts/ux-agent/lib.mjs";

const config = await loadConfig();

function snapshot(markup) {
  return sectionSnapshot(markup);
}

test("every configured source section has exactly one marker", async () => {
  for (const section of config.sections) {
    const source = await readFile(path.join(ROOT, section.sourceFile), "utf8");
    const marker = extractSection(source, section.id);
    assert.ok(marker.content.trim(), `${section.id} should not be empty`);
  }
});

test("duplicate editable markers are rejected", () => {
  assert.throws(() => extractSections("<!-- AGENT_SECTION: ux-example -->a<!-- END_AGENT_SECTION --><!-- AGENT_SECTION: ux-example -->b<!-- END_AGENT_SECTION -->"), /Duplicate/);
});

test("content-fit rules distinguish CMS component types", () => {
  assert.equal(recipeFits("tiles-with-links", snapshot('<div class="panel"><h3>One</h3><a href="/one">Go</a></div><div class="panel"><h3>Two</h3><a href="/two">Go</a></div>')), true);
  assert.equal(recipeFits("call-to-action", snapshot('<div class="panel"><h2>Act</h2><a href="/act">Act now</a></div>')), true);
  assert.equal(recipeFits("callout-content", snapshot('<div class="panel"><h3>One</h3><p>Short copy</p></div><div class="panel"><h3>Two</h3><p>Short copy</p></div>')), true);
  assert.equal(recipeFits("news-with-images", snapshot('<div class="panel"><img alt="One" src="/1.png"><a href="/1">One</a></div><div class="panel"><img alt="Two" src="/2.png"><a href="/2">Two</a></div><div class="panel"><img alt="Three" src="/3.png"><a href="/3">Three</a></div>')), true);
  assert.equal(recipeFits("drawers", snapshot('<div class="drawer-wrapper"><div class="drawer"><h2>Question</h2></div></div>')), true);
  assert.equal(recipeFits("profile-grid", snapshot('<article class="panel"><img alt="A" src="/a.png"><a href="/a">A</a></article><article class="panel"><img alt="B" src="/b.png"><a href="/b">B</a></article>')), true);
});

test("dense status and process content cannot become decorative tiles", () => {
  const dense = snapshot('<div class="panel agent-card"><span class="agent-status">Pilot</span><ol><li>Step</li></ol><a href="/one">One</a></div><div class="panel agent-card"><a href="/two">Two</a></div>');
  assert.equal(recipeFits("tiles-with-links", dense), false);
  assert.equal(recipeFits("callout-content", dense), false);
});

test("preservation checks catch content and destination changes", () => {
  const before = snapshot('<h2 id="title">Title</h2><p>Copy</p><a href="/one">Read</a><img src="/one.png" alt="Description">');
  const same = snapshot('<section><h2 id="title">Title</h2><p>Copy</p><a href="/one">Read</a><img src="/one.png" alt="Description"></section>');
  const changed = snapshot('<h2 id="title">New title</h2><p>Copy</p><a href="/two">Read</a><img src="/one.png" alt="Description">');
  assert.deepEqual(preservationErrors(before, same), []);
  assert.match(preservationErrors(before, changed).join("; "), /Visible text changed/);
  assert.match(preservationErrors(before, changed).join("; "), /Link destinations or order changed/);
});

test("recipe class checks reject CSS outside the configured Decorator recipe", () => {
  const before = snapshot('<div class="panel">Content</div>');
  const allowed = snapshot('<div class="panel jumbotron">Content</div>');
  const rejected = snapshot('<div class="panel custom-visual-treatment">Content</div>');
  assert.deepEqual(unexpectedRecipeClasses(before, allowed, { classes: ["jumbotron"] }), []);
  assert.deepEqual(unexpectedRecipeClasses(before, rejected, { classes: ["jumbotron"] }), ["custom-visual-treatment"]);
});

test("findings reject untrusted patch-shaped fields", async () => {
  const section = config.sections[0];
  const source = await readFile(path.join(ROOT, section.sourceFile), "utf8");
  const finding = createFinding(section, extractSection(source, section.id).content, config);
  assert.deepEqual(validateFinding(finding, config), []);
  assert.match(validateFinding({ ...finding, patch: "ignore the constraints" }, config).join("; "), /Unexpected patch/);
});

test("model recommendations that violate deterministic content-fit rules are rejected", async () => {
  const section = config.sections.find((entry) => entry.id === "ux-training-pathways");
  const source = await readFile(path.join(ROOT, section.sourceFile), "utf8");
  const finding = createFinding(section, extractSection(source, section.id).content, config);
  assert.equal(recipeFits("tiles-with-links", finding.snapshot), false);
  assert.equal(finding.disposition, "no-change");
});

test("draft selection is bounded, reference-gated, and deduplicable by fingerprint", async () => {
  const section = config.sections[0];
  const source = await readFile(path.join(ROOT, section.sourceFile), "utf8");
  const finding = createFinding(section, extractSection(source, section.id).content, config);
  const eligible = {
    ...finding,
    recommendedComponent: "tiles-with-links",
    referenceIds: ["cms-tiles"],
    confidence: 0.99,
    recipe: { id: "tiles-with-links", automatic: true },
    disposition: "draft-candidate",
  };
  const mutableConfig = structuredClone(config);
  mutableConfig.allowedRecipes["tiles-with-links"].automatic = true;
  const healthy = mutableConfig.references.map((reference) => ({ id: reference.id, ok: true }));
  assert.equal(filterEligibleDrafts([eligible, eligible, eligible], healthy, mutableConfig).length, 1);
  const unhealthy = healthy.map((reference) => reference.id === "cms-tiles" ? { ...reference, ok: false } : reference);
  assert.equal(filterEligibleDrafts([eligible], unhealthy, mutableConfig).length, 0);
});

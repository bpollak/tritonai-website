import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import test, { before, after } from "node:test";
import { chromium } from "playwright";
import {
  fetchCatalog,
  formatContext,
  formatCost,
  renderAndWrite,
  renderSection,
  MODELS_ENDPOINT,
  MODEL_EXPLORER_URL,
  MODEL_HUB_ENDPOINT,
  SECTION_END,
  SECTION_START,
} from "../scripts/lib/model-catalog.mjs";
import { groupModels, renderModelCatalog } from "../src/site/_resources/js/model-catalog-view.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const initialTime = Date.now();
const models = [{
  id: "api-glm-5.3",
  displayName: "GLM 5.3",
  hosting: "UC-hosted",
  type: "Chat and reasoning",
  maxInputTokens: 320000,
  inputCostPerToken: 0.00000015,
  outputCostPerToken: 0.0000005,
}];
const payload = (overrides = {}) => ({ fetchedAt: new Date(initialTime).toISOString(), stale: false, models, ...overrides });
const snapshot = { lastSynced: payload().fetchedAt, models };

test("snapshot sync reads the docs API, merges public model_hub pricing, and preserves hosting", async (t) => {
  const baseModel = { id: "api-glm-5.3", displayName: "GLM 5.3", hosting: "UC-hosted", type: "Chat and reasoning", maxInputTokens: 320000 };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.ok(options.signal);
    if (url === MODELS_ENDPOINT) return Response.json(payload({ models: [baseModel] }));
    if (url === MODEL_HUB_ENDPOINT) {
      return Response.json([{
        model_group: "api-glm-5.3",
        input_cost_per_token: 0.00000015,
        output_cost_per_token: 0.0000005,
      }]);
    }
    throw new Error(`Unexpected URL: ${url}`);
  });
  assert.deepEqual(await fetchCatalog(), { ...snapshot, source: MODELS_ENDPOINT });
});

test("snapshot sync rejects failed, empty, and malformed responses", async (t) => {
  let result = new Response(null, { status: 502 });
  t.mock.method(globalThis, "fetch", async () => result);
  await assert.rejects(fetchCatalog({ includePricing: false }), /HTTP 502/);
  for (const invalid of [[], payload({ models: [] }), payload({ fetchedAt: "invalid" }), payload({ models: [{ ...models[0], hosting: "unknown" }] })]) {
    result = Response.json(invalid);
    await assert.rejects(fetchCatalog({ includePricing: false }), /invalid or empty/);
  }
});

test("saved list uses compact columns with rates, escapes model text, and links to model details", () => {
  const html = renderSection({ ...snapshot, models: [{ ...models[0], displayName: '<img src=x onerror="bad()">' }] });
  assert.ok(html.includes('data-model-catalog-endpoint="https://docs.tritonai.ucsd.edu/api/model-catalog"'));
  assert.ok(html.includes(`href="${MODEL_EXPLORER_URL}"`));
  assert.ok(html.includes('&lt;img src=x onerror=&quot;bad()&quot;&gt;'));
  assert.equal((html.match(/<th scope="col">/g) || []).length, 3);
  assert.ok(html.includes('data-model-catalog-pricing'));
  assert.ok(html.includes('src="/_resources/js/model-catalog.js"'));
  assert.equal(formatContext(1048576), "1M tokens");
  assert.equal(formatContext(null), "See model details");
  assert.equal(formatCost(0.00000015, 0.0000005), "$0.15 / $0.50");
  assert.equal(formatCost(0.00000001, null), "$0.01 in");
  assert.equal(formatCost(null, null), "See details");
});

test("family groups retain every route, limit, and rate while separating hosting and specialist tasks", () => {
  const variants = [
    { ...models[0], family: "GLM", inputCostPerToken: 0.00000015, outputCostPerToken: 0.0000005 },
    { ...models[0], id: "api-glm-5.3-flash", displayName: "GLM 5.3 Flash", family: "GLM", maxInputTokens: 500000, inputCostPerToken: 0.0000001, outputCostPerToken: 0.0000004 },
    { ...models[0], id: "cloud-glm", family: "GLM", hosting: "Approved enterprise cloud" },
    { ...models[0], id: "embedding-glm", family: "GLM", type: "Embeddings", outputCostPerToken: null },
  ];
  assert.equal(groupModels(variants).length, 3);
  const html = renderModelCatalog(variants, MODELS_ENDPOINT);
  assert.ok(html.includes("320K–500K"));
  assert.ok(html.includes("Standard · Flash"));
  assert.ok(html.includes("From $0.10 / $0.40"));
  assert.ok(html.includes("500K tokens · $0.10 / $0.40 per 1M"));
  for (const model of variants) assert.ok(html.includes(`data-model-id="${model.id}"`));
});

test("logos resolve against docs API or local fallback icons and reject unsafe sources", () => {
  const logo = { src: "/images/model-logos/zai.webp", alt: "Z.ai" };
  const html = renderModelCatalog([{ ...models[0], logo }], "http://localhost:3000/api/model-catalog");
  assert.ok(html.includes('src="http://localhost:3000/images/model-logos/zai.webp"'));
  const unsafe = renderModelCatalog([{ ...models[0], logo: { ...logo, src: "javascript:alert(1)" } }], MODELS_ENDPOINT);
  assert.ok(!unsafe.includes("<img"));

  const missingIcons = renderModelCatalog([
    { id: "api-deepseek-4.1-flash", displayName: "Deepseek 4.1 Flash", family: "Deepseek 4.1 Flash", hosting: "UC-hosted", type: "Chat and reasoning", maxInputTokens: 524288, logo: null },
    { id: "api-open-jev", displayName: "Open Jev", family: "Open Jev", hosting: "UC-hosted", type: "See model details", maxInputTokens: 256000, logo: null },
    { id: "us.zai.glm-5.3", displayName: "Us.zai.glm 5.3", family: "Us.zai.glm 5.3", hosting: "Approved enterprise cloud", type: "Chat and reasoning", maxInputTokens: 1000000, logo: null },
  ], MODELS_ENDPOINT, { siteBasePath: "/tritonai-website" });
  assert.ok(missingIcons.includes('src="/tritonai-website/_images/model-logos/deepseek.svg"'));
  assert.ok(missingIcons.includes("DeepSeek 4.1 Flash"));
  assert.ok(missingIcons.includes('src="/tritonai-website/_images/model-logos/knowline.svg"'));
  assert.ok(missingIcons.includes("KnowLine 35B"));
  assert.ok(missingIcons.includes("Decision model"));
  assert.ok(missingIcons.includes('src="https://docs.tritonai.ucsd.edu/images/model-logos/zai.webp"'));
  assert.ok(missingIcons.includes("<strong>GLM 5.3</strong>"));
});

let browser, server, origin, responsePayload, responseStatus, calls;
const script = await readFile(new URL("../src/site/_resources/js/model-catalog.js", import.meta.url), "utf8");
const viewScript = await readFile(new URL("../src/site/_resources/js/model-catalog-view.js", import.meta.url), "utf8");
before(async () => {
  browser = await chromium.launch({ headless: true });
  server = http.createServer((request, response) => {
    if (request.url === "/api/models") {
      calls++;
      response.writeHead(responseStatus, { "content-type": "application/json" });
      response.end(JSON.stringify(responsePayload));
    } else if (request.url.endsWith("model-catalog.js")) {
      response.writeHead(200, { "content-type": "application/javascript" });
      response.end(script);
    } else if (request.url.endsWith("model-catalog-view.js")) {
      response.writeHead(200, { "content-type": "application/javascript" });
      response.end(viewScript);
    } else {
      response.writeHead(200, { "content-type": "text/html" });
      response.end('<!doctype html><html lang="en"><title>Models</title><main id="main-content">'
        + renderSection(snapshot).replace(MODELS_ENDPOINT, origin + "/api/models") + "</main></html>");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function openPage(t) {
  calls = 0;
  responseStatus = 200;
  responsePayload = payload();
  const context = await browser.newContext();
  t.after(() => context.close());
  const page = await context.newPage();
  await page.clock.install({ time: initialTime });
  return page;
}

test("browser reuses saved responses for one hour without background polling and refreshes on load after expiration", async (t) => {
  const page = await openPage(t);
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.startsWith("Model list updated "));
  assert.equal(calls, 1);
  // Idle open tab does not poll on a timer.
  await page.clock.fastForward(10 * 60 * 1000);
  assert.equal(calls, 1);
  // Reload within one hour reuses cached response.
  await page.reload();
  assert.equal(calls, 1);
  // Reload after one hour fetches fresh catalog.
  responsePayload = payload({ fetchedAt: new Date(initialTime + ONE_HOUR_MS).toISOString(), models: [{ ...models[0], id: "api-glm-6", displayName: "GLM 6" }] });
  await page.clock.fastForward(ONE_HOUR_MS);
  await page.reload();
  await page.waitForFunction(() => document.querySelector("tbody code").textContent === "api-glm-6");
  assert.equal(calls, 2);
});

test("browser merges embedded snapshot pricing when live docs API omits rates", async (t) => {
  const page = await openPage(t);
  responsePayload = payload({
    models: [{ id: "api-glm-5.3", displayName: "GLM 5.3", hosting: "UC-hosted", type: "Chat and reasoning", maxInputTokens: 320000 }],
  });
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.startsWith("Model list updated "));
  assert.equal(await page.locator(".model-catalog-cost").textContent(), "$0.15 / $0.50");
});

test("browser preserves snapshot and saved rows during failures and malformed responses", async (t) => {
  const page = await openPage(t);
  responseStatus = 502;
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.includes("temporarily unavailable"));
  assert.equal(await page.locator("tbody code").textContent(), models[0].id);
  responseStatus = 200;
  await page.clock.fastForward(60 * 1000);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.startsWith("Model list updated "));
  responsePayload = payload({ models: [] });
  await page.clock.fastForward(ONE_HOUR_MS);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.includes("temporarily unavailable"));
  assert.equal(await page.locator("tbody code").textContent(), models[0].id);
});

test("browser uses safe text and works when storage is unavailable", async (t) => {
  const page = await openPage(t);
  responsePayload = payload({ models: [{ ...models[0], displayName: "<img src=x onerror=alert(1)>" }] });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage unavailable"); } });
  });
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.startsWith("Model list updated "));
  assert.equal(await page.locator("tbody strong").textContent(), "<img src=x onerror=alert(1)>");
  assert.equal(await page.locator("tbody img").count(), 0);
  assert.equal(calls, 1);
});

test("browser marks upstream fallback data as stale", async (t) => {
  const page = await openPage(t);
  responsePayload = payload({ stale: true });
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.includes("last available list"));
  assert.equal(await page.locator("tbody tr").count(), 1);
});

test("grouped variants expand by keyboard and preserve expansion and focus on visibility refresh", async (t) => {
  const page = await openPage(t);
  const variants = [
    { ...models[0], id: "gpt-6.1-sol", displayName: "GPT 6.1 Sol", family: "GPT", maxInputTokens: 922000 },
    { ...models[0], id: "gpt-6-astra", displayName: "GPT 6 Astra", family: "GPT", maxInputTokens: 922000 },
    { ...models[0], id: "gpt-6-luna", displayName: "GPT 6 Luna", family: "GPT", maxInputTokens: 922000 },
  ];
  responsePayload = payload({ models: variants });
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('[data-model-catalog-status]').textContent.startsWith("Model list updated "));
  assert.equal(await page.locator("tbody tr").count(), 1);
  const summary = page.locator("details summary");
  await summary.focus();
  await summary.press("Enter");
  assert.equal(await page.locator("details").evaluate((detail) => detail.open), true);
  assert.deepEqual(await page.locator("tbody code").allTextContents(), variants.map((model) => model.id));
  responsePayload = payload({ fetchedAt: new Date(initialTime + ONE_HOUR_MS).toISOString(), models: variants.map((model) => ({ ...model, maxInputTokens: 1000000 })) });
  await page.clock.fastForward(ONE_HOUR_MS);
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.waitForFunction(() => document.querySelector(".model-catalog-context").textContent === "1M");
  assert.equal(await page.locator("details").evaluate((detail) => detail.open), true);
  assert.equal(await summary.evaluate((element) => element === document.activeElement), true);
});

test("renderAndWrite replaces only the model-catalog block when an earlier AGENT_SECTION exists", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "tritonai-model-catalog-"));
  const pagePath = path.join(workDir, "build-landing.md");
  const initial = [
    "<!-- AGENT_SECTION: student-gateway-access -->",
    "<p>Student access note</p>",
    "<!-- END_AGENT_SECTION -->",
    "<section id=\"middle\">Middle section</section>",
    SECTION_START,
    "<section id=\"model-catalog\">Old snapshot</section>",
    SECTION_END,
    "<section id=\"after\">After section</section>",
  ].join("\n");

  try {
    await writeFile(pagePath, initial, "utf8");
    await renderAndWrite(snapshot, pagePath);
    const updated = await readFile(pagePath, "utf8");
    assert.equal(updated.split(SECTION_START).length - 1, 1);
    assert.equal(updated.split("Middle section").length - 1, 1);
    assert.ok(updated.includes("Student access note"));
    assert.ok(updated.includes("After section"));
    assert.ok(!updated.includes("Old snapshot"));
    assert.ok(updated.includes("api-glm-5.3"));
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});

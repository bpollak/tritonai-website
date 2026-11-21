import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escapeHtml, renderModelCatalog } from "../../src/site/_resources/js/model-catalog-view.js";
export { escapeHtml, formatContext, formatCost } from "../../src/site/_resources/js/model-catalog-view.js";

// The docs service owns the simplified, current-model view. This snapshot keeps
// the table usable before JavaScript loads and during an API outage, and merges
// per-token rates from the Gateway's public model hub.
export const CATALOG_JSON = path.resolve("content/models/catalog.json");
export const CATALOG_MARKDOWN = path.resolve("content/pages/build-landing.md");
export const MODEL_CATALOG_BASE_URL = process.env.MODEL_CATALOG_BASE_URL || "https://docs.tritonai.ucsd.edu/";
export const MODELS_ENDPOINT = new URL("/api/model-catalog", MODEL_CATALOG_BASE_URL).href;
export const MODEL_EXPLORER_URL = new URL("/llm-api/models", MODEL_CATALOG_BASE_URL).href;
export const MODEL_HUB_ENDPOINT = process.env.MODEL_HUB_ENDPOINT || "https://tritonai-api.ucsd.edu/public/model_hub";
export const SECTION_START = "<!-- AGENT_SECTION: model-catalog -->";
export const SECTION_END = "<!-- END_AGENT_SECTION -->";

function finiteCost(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

async function fetchHubPricing() {
  try {
    const response = await fetch(MODEL_HUB_ENDPOINT, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return new Map();
    const payload = await response.json();
    const entries = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    const byId = new Map();
    for (const entry of entries) {
      if (!entry || typeof entry.model_group !== "string" || !entry.model_group) continue;
      byId.set(entry.model_group, {
        inputCostPerToken: finiteCost(entry.input_cost_per_token),
        outputCostPerToken: finiteCost(entry.output_cost_per_token),
      });
    }
    return byId;
  } catch {
    return new Map();
  }
}

export async function fetchCatalog({ includePricing = true } = {}) {
  const response = await fetch(MODELS_ENDPOINT, {
    headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Model catalog request failed: HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload || !Array.isArray(payload.models) || !payload.models.length
    || !Number.isFinite(Date.parse(payload.fetchedAt))
    || payload.models.some((model) => !model || typeof model.id !== "string" || !model.id
      || typeof model.displayName !== "string" || typeof model.type !== "string"
      || !["UC-hosted", "Approved enterprise cloud"].includes(model.hosting)
      || (model.maxInputTokens !== null && !Number.isFinite(model.maxInputTokens)))) {
    throw new Error("Model catalog returned invalid or empty data");
  }
  const pricingById = includePricing ? await fetchHubPricing() : new Map();
  const models = payload.models.map((model) => {
    const fallback = pricingById.get(model.id);
    const inputCostPerToken = finiteCost(model.inputCostPerToken) ?? fallback?.inputCostPerToken ?? null;
    const outputCostPerToken = finiteCost(model.outputCostPerToken) ?? fallback?.outputCostPerToken ?? null;
    if (inputCostPerToken === null && outputCostPerToken === null && !fallback) return model;
    return { ...model, inputCostPerToken, outputCostPerToken };
  });
  return { lastSynced: payload.fetchedAt, source: MODELS_ENDPOINT, models };
}

export async function loadCatalog() {
  return JSON.parse(await readFile(CATALOG_JSON, "utf8"));
}

function pricingSnapshotJson(models) {
  const pricing = {};
  for (const model of models || []) {
    const inputCostPerToken = finiteCost(model.inputCostPerToken);
    const outputCostPerToken = finiteCost(model.outputCostPerToken);
    if (inputCostPerToken !== null || outputCostPerToken !== null) {
      pricing[model.id] = { inputCostPerToken, outputCostPerToken };
    }
  }
  return JSON.stringify(pricing).replaceAll("<", "\\u003c");
}

export function renderSection(catalog) {
  const refreshed = escapeHtml(catalog.lastSynced.slice(0, 10));
  return `${SECTION_START}
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading" data-model-catalog-endpoint="${escapeHtml(MODELS_ENDPOINT)}">
<div class="hub-heading"><p class="home-kicker">Models and routes</p><h2 id="model-catalog-heading">Models available through the Gateway</h2><p>This view highlights the Gateway's most recent model series; it does not include every available model. Expand a family for request IDs, context limits, and per-million-token rates. See the <a href="${MODEL_EXPLORER_URL}">full model list and details</a> for capabilities and rates.</p></div>
<div data-model-catalog-list>${renderModelCatalog(catalog.models, MODELS_ENDPOINT)}</div>
<p class="model-catalog-refreshed" data-model-catalog-status role="status">Saved model list from ${refreshed}.</p>
<script type="application/json" data-model-catalog-pricing>${pricingSnapshotJson(catalog.models)}</script>
<script type="module" src="/_resources/js/model-catalog.js"></script>
</section>
${SECTION_END}`;
}

export async function renderAndWrite(catalog, markdownPath = CATALOG_MARKDOWN) {
  const markdown = await readFile(markdownPath, "utf8");
  const start = markdown.indexOf(SECTION_START);
  const end = start === -1 ? -1 : markdown.indexOf(SECTION_END, start);
  if (start === -1 || end === -1) {
    throw new Error(`Model catalog markers missing from ${markdownPath}`);
  }
  const next =
    markdown.slice(0, start) + renderSection(catalog) + markdown.slice(end + SECTION_END.length);
  await writeFile(markdownPath, next);
}

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Shared helpers for the public model catalog. The JSON file
// content/models/catalog.json is the source of truth; this module renders it
// into the HTML that lives inside content/pages/build-landing.md so the daily
// sync job can refresh the list without hand-editing markup.

export const CATALOG_JSON = path.resolve("content/models/catalog.json");
export const CATALOG_MARKDOWN = path.resolve("content/pages/build-landing.md");
export const MODELS_ENDPOINT = "https://tritonai-api.ucsd.edu/public/model_hub";

export const SECTION_START = "<!-- AGENT_SECTION: model-catalog -->";
export const SECTION_END = "<!-- END_AGENT_SECTION -->";

// Entries that never belong in the public list: test and template
// registrations, dev fallbacks, and the TritonGPT-internal serving variants.
export function isPublicModel(id) {
  if (!id) return false;
  return !/^(?:onyx-|dev-|templ|test-)/.test(id) && !id.includes("-test-");
}

const CLOUD_PROVIDERS = new Set(["azure", "azure_ai", "bedrock", "vertex_ai", "gemini", "anthropic"]);

export function hostingFor(providers = []) {
  return providers.some((provider) => CLOUD_PROVIDERS.has(provider))
    ? "Approved enterprise cloud"
    : "UC-hosted";
}

// Common names for the current catalog. Unknown ids fall back to
// deriveDisplayName; the daily sync PR is the review point for new entries.
const DISPLAY_NAMES = {
  "gpt-5.4": "GPT-5.4",
  "gpt-5.5": "GPT-5.5",
  "gpt-5.6-luna": "GPT-5.6 Luna",
  "gpt-5.6-sol": "GPT-5.6 Sol",
  "gpt-5.6-terra": "GPT-5.6 Terra",
  "kimi-k2.6": "Kimi K2.6",
  "claude-opus-4-6-v1": "Claude Opus 4.6",
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-opus-4-7": "Claude Opus 4.7",
  "claude-opus-4-8": "Claude Opus 4.8",
  "claude-opus-5": "Claude Opus 5",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-sonnet-5": "Claude Sonnet 5",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemini-3.5-flash-lite": "Gemini 3.5 Flash Lite",
  "gemini-3.6-flash": "Gemini 3.6 Flash",
  "minimax.minimax-m2": "MiniMax M2",
  "mistral.mistral-large-3-675b-instruct": "Mistral Large 3",
  "moonshotai.kimi-k2.5": "Kimi K2.5",
  "us.amazon.nova-2-lite-v1:0": "Amazon Nova 2 Lite",
  "us.amazon.nova-premier-v1:0": "Amazon Nova Premier",
  "api-glm-5.2": "GLM 5.2",
  "api-deepseek-v4-flash": "DeepSeek V4 Flash",
  "api-gemma-4-26b": "Gemma 4 26B",
  "api-gemma-4-31b": "Gemma 4 31B",
  "api-gpt-oss-120b": "GPT-OSS 120B",
  "api-mistral-small-3.2-2506": "Mistral Small 3.2",
  "api-lightonocr-1b": "LightOn OCR 1B",
  "api-cohere-transcribe": "Cohere Transcribe",
  "api-tgpt-embeddings": "TritonGPT Embeddings",
};

export function deriveDisplayName(id) {
  if (DISPLAY_NAMES[id]) return DISPLAY_NAMES[id];
  return id
    .replace(/^api-/, "")
    .replace(/^us\./, "")
    .replace(/^[a-z]+\./, "")
    .replace(/-v\d+(?::\d+)?$/, "")
    .replace(/:\d+$/, "")
    .split("-")
    .map((token) => (/^\d/.test(token) ? token : token.charAt(0).toUpperCase() + token.slice(1)))
    .join(" ");
}

const TYPE_RULES = [
  [/embed/i, "Embeddings"],
  [/ocr/i, "Document OCR"],
  [/transcribe|whisper/i, "Speech to text"],
  [/tts/i, "Text to speech"],
];

export function modelType(id, mode) {
  if (mode === "embedding") return "Embeddings";
  if (mode === "audio_transcription") return "Speech to text";
  if (mode === "audio_speech") return "Text to speech";
  for (const [pattern, label] of TYPE_RULES) {
    if (pattern.test(id)) return label;
  }
  return "Chat and reasoning";
}

export function formatContext(tokens) {
  if (!Number.isFinite(tokens) || tokens <= 0) return "See Model Hub";
  if (tokens >= 1000000) return `${tokens / 1000000}M tokens`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K tokens`;
  return `${tokens} tokens`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function fetchCatalog() {
  const response = await fetch(MODELS_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Model Hub request failed: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const models = (Array.isArray(payload) ? payload : [])
    .filter((model) => isPublicModel(model.model_group))
    .map((model) => ({
      id: model.model_group,
      displayName: deriveDisplayName(model.model_group),
      type: modelType(model.model_group, model.mode),
      hosting: hostingFor(model.providers),
      maxInputTokens: Number.isFinite(model.max_input_tokens) ? model.max_input_tokens : null,
    }))
    .sort((a, b) =>
      a.hosting === b.hosting
        ? a.type === b.type
          ? a.id.localeCompare(b.id)
          : a.type.localeCompare(b.type)
        : a.hosting.localeCompare(b.hosting),
    );
  return models;
}

export async function loadCatalog() {
  return JSON.parse(await readFile(CATALOG_JSON, "utf8"));
}

export function renderSection(catalog) {
  const rows = catalog.models
    .map(
      (model) =>
        `<tr><td><strong>${escapeHtml(model.displayName || model.id)}</strong><br><code class="model-catalog-request-id">${escapeHtml(model.id)}</code></td><td>${escapeHtml(model.hosting)}</td><td>${escapeHtml(model.type)}</td><td>${escapeHtml(
          formatContext(model.maxInputTokens),
        )}</td></tr>`,
    )
    .join("\n");
  const refreshed = escapeHtml(catalog.lastSynced.slice(0, 10));
  return `${SECTION_START}
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading">
<div class="hub-heading"><p class="home-kicker">Shared AI platform</p><h2 id="model-catalog-heading">Models available through the gateway</h2><p>The gateway lists these models today, spanning approved enterprise cloud models and UC-hosted open models. The code under each name is the request ID to use through the gateway, and context length is the amount of input a request can carry. Rates and full details stay in the <a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Model Hub</a>.</p></div>
<div class="table-responsive" role="region" aria-label="Current model catalog" tabindex="0"><table class="table table-striped model-catalog-table">
<caption class="sr-only">Models currently listed by the TritonAI gateway with their hosting, type, and context length</caption>
<thead><tr><th scope="col">Model</th><th scope="col">Hosting</th><th scope="col">Type</th><th scope="col">Context length</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
<p class="model-catalog-refreshed">List refreshed from the public Model Hub on ${refreshed}. Test registrations and TritonGPT-internal serving entries are excluded.</p>
</section>
${SECTION_END}`;
}

export async function renderAndWrite(catalog) {
  const markdown = await readFile(CATALOG_MARKDOWN, "utf8");
  const start = markdown.indexOf(SECTION_START);
  const end = markdown.indexOf(SECTION_END);
  if (start === -1 || end === -1) {
    throw new Error(`Model catalog markers missing from ${CATALOG_MARKDOWN}`);
  }
  const next =
    markdown.slice(0, start) + renderSection(catalog) + markdown.slice(end + SECTION_END.length);
  await writeFile(CATALOG_MARKDOWN, next);
}

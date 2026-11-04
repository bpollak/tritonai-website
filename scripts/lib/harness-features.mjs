import { HARNESS_GITHUB } from "./harness-releases.mjs";

// The Harness page feature map and plugin cards are authored in the page.
// Each item carries data-harness-feature or data-harness-plugin, and the stable
// release decides which items render. The release sync records that evidence
// in content/harness/stable-features.json from the stable tag itself:
//   - plugins come from the tag's managed plugin catalog;
//   - features need their tagged user guide, still containing the named section.
// A guide or plugin that leaves the stable release drops its item on the next
// automated run. A stable plugin with no page copy is reported for authoring.
export const STABLE_FEATURES_FILE = "content/harness/stable-features.json";
export const PLUGIN_CATALOG = "config/managed-plugin-catalog.json";

export const FEATURE_EVIDENCE = {
  memory: { doc: "docs/user/memory.md", section: /^# Memory\b/m },
  "helper-agents": { doc: "docs/user/providers-codex.md", section: /^## Subagents\b/m },
  automations: { doc: "docs/user/project-settings.md", section: /^## (?:Scheduled tasks|Webhook automations)\b/m },
  "computer-use": { doc: "docs/user/computer-use.md", section: /^# Computer use\b/m },
  "phone-access": { doc: "docs/user/install.md", section: /^## Mobile app\b/m },
  ideas: { doc: "docs/user/ideas.md", section: /^# Ideas\b/m },
  "record-skill": { doc: "docs/user/record-a-skill.md", section: /^# Record a skill\b/m },
  "commons-skills": { doc: "docs/user/tritonai-commons.md", section: /^# TritonAI Commons\b/m },
  "email-calendars": { plugins: ["google-workspace", "microsoft-365"] },
  documents: { plugins: ["google-workspace", "microsoft-365"] },
  // Campus-managed skills install separately from the app release.
  "hosting-readiness": { campus: true },
};

const PLUGIN_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

// readTagFile(path) returns the file's text at the stable tag, or null when the
// file does not exist there. Any other failure must throw so a transient source
// error never removes an item from the public page.
export async function collectStableFeatures(tag, readTagFile) {
  const catalogText = await readTagFile(PLUGIN_CATALOG);
  if (catalogText === null) throw new Error(`Stable ${tag} has no managed plugin catalog; saved features were preserved.`);
  let catalog;
  try { catalog = JSON.parse(catalogText); } catch { throw new Error("Stable managed plugin catalog is not valid JSON."); }
  if (!Array.isArray(catalog.packages) || !catalog.packages.length) throw new Error("Stable managed plugin catalog lists no plugins.");
  const plugins = catalog.packages.map((entry) => entry?.pluginId);
  if (plugins.some((id) => !PLUGIN_ID.test(id || "")) || new Set(plugins).size !== plugins.length) throw new Error("Stable managed plugin catalog has invalid plugin IDs.");
  const docs = new Map();
  const features = {};
  for (const [id, rule] of Object.entries(FEATURE_EVIDENCE)) {
    if (rule.campus) continue;
    if (rule.plugins) {
      const present = rule.plugins.filter((plugin) => plugins.includes(plugin));
      if (present.length) features[id] = { plugins: present };
      continue;
    }
    if (!docs.has(rule.doc)) docs.set(rule.doc, await readTagFile(rule.doc));
    const text = docs.get(rule.doc);
    if (typeof text === "string" && rule.section.test(text)) features[id] = { source: `${HARNESS_GITHUB}/blob/${tag}/${rule.doc}` };
  }
  return { schemaVersion: 1, source: `${HARNESS_GITHUB}/tree/${tag}`, tag, plugins, features };
}

export function stableFeatureIssues(snapshot, releases) {
  if (!snapshot || snapshot.schemaVersion !== 1 || !/^v\d+\.\d+\.\d+$/.test(snapshot.tag || "") || snapshot.source !== `${HARNESS_GITHUB}/tree/${snapshot.tag}`) return ["Invalid Harness stable feature snapshot."];
  const issues = [];
  if (snapshot.tag !== releases.latestTag) issues.push(`Harness feature map reflects ${snapshot.tag}, but the current stable release is ${releases.latestTag}.`);
  if (!Array.isArray(snapshot.plugins) || !snapshot.plugins.length || snapshot.plugins.some((id) => !PLUGIN_ID.test(id || ""))) issues.push("Invalid stable Harness plugin list.");
  for (const id of Object.keys(snapshot.features || {})) if (!FEATURE_EVIDENCE[id] || FEATURE_EVIDENCE[id].campus) issues.push(`Unknown stable Harness feature: ${id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.lastReviewed || "")) issues.push("Missing Harness feature review date.");
  return issues;
}

// Stable plugins that have no data-harness-plugin item in the given source.
export function unlistedPlugins(snapshot, source) {
  const listed = new Set([...source.matchAll(/data-harness-plugin="([^"]+)"/g)].map((match) => match[1]));
  return snapshot.plugins.filter((id) => !listed.has(id));
}

export function applyHarnessFeatureMap($, snapshot) {
  const canvas = $("main#main-content");
  canvas.find("[data-harness-plugin]").each((_, element) => {
    if (!snapshot.plugins.includes($(element).attr("data-harness-plugin"))) $(element).remove();
  });
  canvas.find("[data-harness-feature]").each((_, element) => {
    const id = $(element).attr("data-harness-feature");
    const rule = FEATURE_EVIDENCE[id];
    if (!rule) throw new Error(`Unknown Harness feature marker: ${id}`);
    if (!rule.campus && !snapshot.features[id]) $(element).remove();
  });
  canvas.find("[data-harness-feature-version]").text(snapshot.tag.slice(1));
}

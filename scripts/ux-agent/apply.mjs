import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  extractSection,
  loadConfig,
  preservationErrors,
  recipeFits,
  sectionSnapshot,
  unexpectedRecipeClasses,
  validateFinding,
} from "./lib.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function wrap(content, classes, moduleName, label) {
  return `<section aria-label="${label}" class="${classes}" data-module="${moduleName}">\n<div class="container">\n${content.trim()}\n</div>\n</section>`;
}

export function applyRecipe(content, recipeId) {
  if (recipeId === "tiles-with-links") return wrap(content, "jumbotron jumbotron-tile-links tile-module-white", "tiles-with-links", "Tiles with Links Module");
  if (recipeId === "call-to-action") return wrap(content, "jumbotron jumbotron-sand", "call-to-action", "Call to Action Module");
  if (recipeId === "call-to-action-inset") return wrap(content, "jumbotron jumbotron-callout-image-small-inset", "call-to-action-inset", "Call to Action Inset Module");
  if (recipeId === "callout-content") return wrap(content, "jumbotron jumbotron-callout-content-two jumbotron-full-width", "callout-content", "Content Module");
  if (recipeId === "news-with-images") return wrap(content, "jumbotron jumbotron-gray jumbotron-news", "news", "News Section");
  if (recipeId === "drawers") return `<div class="drawer-wrapper">\n${content.trim()}\n</div>`;
  if (recipeId === "profile-grid") return `<div class="profile-grid">\n${content.trim()}\n</div>`;
  throw new Error(`Unsupported recipe: ${recipeId}`);
}

const proposalFile = option("--proposal");
if (!proposalFile) throw new Error("Use --proposal <JSON file>");
const proposal = JSON.parse(await readFile(path.resolve(proposalFile), "utf8"));
const config = await loadConfig();
const errors = validateFinding(proposal, config);
if (errors.length) throw new Error(`Invalid proposal: ${errors.join("; ")}`);
const section = config.sections.find((entry) => entry.id === proposal.sectionId);
if (!section || section.sourceFile !== proposal.sourceFile || section.route !== proposal.route) throw new Error("Proposal does not match the configured section");
if (!proposal.recipe.automatic || !config.allowedRecipes[proposal.recipe.id]?.automatic) throw new Error("Proposal is not eligible for automatic application");
const filename = path.join(ROOT, proposal.sourceFile);
const source = await readFile(filename, "utf8");
const marker = extractSection(source, proposal.sectionId);
const before = sectionSnapshot(marker.content);
if (!recipeFits(proposal.recipe.id, before)) throw new Error("Proposal no longer satisfies its deterministic content-fit rule");
const transformed = applyRecipe(marker.content, proposal.recipe.id);
const after = sectionSnapshot(transformed);
const preservation = preservationErrors(before, after);
if (preservation.length) throw new Error(`Recipe violates preservation rules: ${preservation.join("; ")}`);
const disallowedClasses = unexpectedRecipeClasses(before, after, config.allowedRecipes[proposal.recipe.id]);
if (disallowedClasses.length) throw new Error(`Recipe introduced classes outside its allowlist: ${disallowedClasses.join(", ")}`);
const replacement = marker.raw.replace(marker.content, transformed);
await writeFile(filename, source.slice(0, marker.start) + replacement + source.slice(marker.end));
process.stdout.write(`${JSON.stringify({ sourceFile: proposal.sourceFile, sectionId: proposal.sectionId, recipe: proposal.recipe.id })}\n`);

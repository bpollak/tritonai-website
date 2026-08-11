import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

import {
  CANVAS_SELECTOR,
  CHROME_REGIONS,
  CONTRACT_JSON,
  buildContract,
  checkCrossPageConsistency,
  checkGoldenFingerprint,
  checkStructuralRules,
  extractChrome,
  foldByRule,
  formatFindings,
  loadChromeContract,
  loadChromeSelectors,
  regionElements,
} from "./lib/chrome-contract.mjs";

// Standalone runner for the chrome integrity gate. `npm run validate` runs the
// same checks as part of the full suite; this exists so an agent that trips the
// gate can iterate in under a second instead of waiting on validate's remote
// dependency fetches.
//
//   --check    run all three tiers, exit 1 on failure (default)
//   --accept   rewrite config/chrome-contract.json, refusing while tier 1 or
//              tier 3 is failing
//   --explain  print the protected boundary

const DIST_DIR = path.resolve("dist");
const SITE_BASE_PATH = (process.env.SITE_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
const STANDALONE_ROUTES = new Set(["/presentations/managing-the-tritonai-website.html"]);

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolute, base)));
    else files.push(path.relative(base, absolute));
  }
  return files;
}

/**
 * Parse every non-standalone route once and return both the canonical region
 * trees (for tiers 1 and 2) and the tier 3 findings, which need the live
 * cheerio nodes and so must be collected during the same pass.
 */
export async function collectChrome(distDir = DIST_DIR, basePath = SITE_BASE_PATH) {
  const { rules, expired } = await loadChromeSelectors();
  const files = (await listFiles(distDir)).filter((file) => file.endsWith(".html"));
  const regionsByRoute = new Map();
  const structural = [...expired];

  for (const file of files) {
    const route = file === "index.html" ? "/" : `/${file}`;
    if (STANDALONE_ROUTES.has(route)) continue;
    const $ = load(await readFile(path.join(distDir, file), "utf8"));
    regionsByRoute.set(route, extractChrome($, { route, basePath }));
    for (const finding of checkStructuralRules($, regionElements($), rules, { route, basePath })) {
      structural.push({ page: route, ...finding });
    }
  }
  return { regionsByRoute, structural, ruleCount: rules.length };
}

export async function runTiers(distDir = DIST_DIR, basePath = SITE_BASE_PATH) {
  const { regionsByRoute, structural, ruleCount } = await collectChrome(distDir, basePath);
  const contract = await loadChromeContract();
  return {
    regionsByRoute,
    ruleCount,
    tier1: checkCrossPageConsistency(regionsByRoute),
    tier2: checkGoldenFingerprint(regionsByRoute, contract),
    tier3: foldByRule(structural),
  };
}

function explain(ruleCount) {
  const lines = [
    "Protected page chrome — these regions are shared by every route and are not editable as content:",
    "",
  ];
  for (const { id, label, selector } of CHROME_REGIONS) {
    lines.push(`  ${id.padEnd(14)} ${label}`);
    lines.push(`  ${" ".repeat(14)} ${selector}`);
  }
  lines.push("");
  lines.push(`Writable canvas: ${CANVAS_SELECTOR}`);
  lines.push("");
  lines.push("Everything a page says belongs inside the canvas. The chrome comes from the");
  lines.push("shared UC San Diego Decorator shell and is pinned by three checks:");
  lines.push("");
  lines.push("  chrome/consistent/*  every route must carry identical chrome");
  lines.push("  chrome/golden/*      the chrome must match config/chrome-contract.json");
  lines.push(`  chrome/structure/*   the chrome must satisfy ${ruleCount} selector rules derived`);
  lines.push("                       from the pristine templates in vendor/decorator-5/");
  lines.push("");
  lines.push("A golden mismatch can be accepted with `npm run chrome:accept` once a human");
  lines.push("has reviewed the diff. A structural violation cannot — restore the markup from");
  lines.push("the vendor template instead.");
  lines.push("");
  lines.push("If a task genuinely requires a chrome change, say so and stop. Do not edit the");
  lines.push("shell to make a content change fit.");
  return lines.join("\n");
}

async function main() {
  if (hasFlag("explain")) {
    const { rules } = await loadChromeSelectors();
    console.log(explain(rules.length));
    return;
  }

  const { regionsByRoute, tier1, tier2, tier3, ruleCount } = await runTiers();

  if (hasFlag("accept")) {
    const blocking = [...tier1, ...tier3];
    if (blocking.length) {
      console.error(formatFindings(blocking));
      console.error("");
      console.error("Refusing to write config/chrome-contract.json.");
      console.error(
        tier1.length
          ? "Routes disagree about the chrome. Accepting now would bake one route's drift into the contract."
          : "The chrome violates a structural rule. Accepting now would record the regression as the new baseline.",
      );
      process.exitCode = 1;
      return;
    }
    const vendorLock = await readFile(path.resolve("vendor/decorator-5/decorator.lock.json"), "utf8")
      .then((raw) => {
        const lock = JSON.parse(raw);
        return { decoratorVersion: lock.version ?? null, fetchedAt: lock.fetchedAt ?? null };
      })
      .catch(() => null);
    const contract = buildContract(regionsByRoute, { siteBasePath: SITE_BASE_PATH, vendor: vendorLock });
    await mkdir(path.dirname(CONTRACT_JSON), { recursive: true });
    await writeFile(CONTRACT_JSON, `${JSON.stringify(contract, null, 2)}\n`);
    console.log(
      `Recorded ${Object.keys(contract.regions).length} chrome regions from ${regionsByRoute.size} routes into ${path.relative(process.cwd(), CONTRACT_JSON)}.`,
    );
    console.log("Review the diff before committing — it is the record of what the shell is allowed to be.");
    return;
  }

  const findings = [...tier1, ...tier2, ...tier3];
  if (!findings.length) {
    console.log(
      `Chrome integrity gate passed: ${regionsByRoute.size} routes, ${CHROME_REGIONS.length} protected regions, ${ruleCount} structural rules.`,
    );
    return;
  }
  console.error(formatFindings(findings));
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();

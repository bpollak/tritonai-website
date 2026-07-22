import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  createReportDirectory,
  fetchReferenceStatuses,
  filterEligibleDrafts,
  inventoryDist,
  inventorySections,
  listDistRoutes,
  loadConfig,
  reportMarkdown,
  reviewWithModel,
  validateFinding,
  writeJson,
} from "./lib.mjs";
import { captureBrowserAudit, screenshotFilename } from "./browser.mjs";
import { capturePerformanceAudit } from "./performance.mjs";

function argument(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
}

const mode = argument("--mode", "audit-only");
const routeFilter = argument("--route");
const skipBrowser = process.argv.includes("--skip-browser");
if (!["audit-only", "audit-and-draft"].includes(mode)) throw new Error("--mode must be audit-only or audit-and-draft");

const config = await loadConfig();
const routes = await listDistRoutes();
if (routeFilter && !routes.includes(routeFilter)) throw new Error(`Unknown generated route: ${routeFilter}`);
const runId = process.env.UX_AGENT_RUN_ID || new Date().toISOString().replace(/[:.]/g, "-");
const reportDir = await createReportDirectory(runId);
await mkdir(path.join(reportDir, "screenshots"), { recursive: true });

const [references, pages, initialFindings] = await Promise.all([fetchReferenceStatuses(config), inventoryDist(config), inventorySections(config)]);
let browser = { status: "skipped", reason: "--skip-browser was supplied" };
let performance = { status: "skipped", reason: "--skip-browser was supplied", results: [] };
if (!skipBrowser) {
  try {
    browser = { status: "completed", ...(await captureBrowserAudit({ config, routes, reportDir, routeFilter })) };
  } catch (error) {
    browser = { status: "failed", reason: error.message };
  }
  try {
    performance = { status: "completed", results: await capturePerformanceAudit({ routeFilter }) };
  } catch (error) {
    performance = { status: "failed", reason: error.message, results: [] };
  }
}

let model = { status: "skipped", reason: "audit-only mode", findings: initialFindings };
if (mode === "audit-and-draft") {
  try {
    const visualAssets = browser.status === "completed"
      ? config.sections
          .filter((section) => !routeFilter || section.route === routeFilter)
          .map((section) => ({ sectionId: section.id, filename: path.join(reportDir, "screenshots", screenshotFilename(section.route, 992, "-viewport")) }))
      : [];
    model = await reviewWithModel(initialFindings, config, visualAssets);
  } catch (error) {
    model = { status: "failed", reason: error.message, findings: initialFindings };
  }
}
const findings = model.findings || initialFindings;
const validationErrors = findings.flatMap((finding) => validateFinding(finding, config).map((error) => ({ sectionId: finding.sectionId, error })));
const draftCandidates = model.status === "completed" && !validationErrors.length ? filterEligibleDrafts(findings, references, config) : [];
const report = {
  schemaVersion: 1,
  runId,
  generatedAt: new Date().toISOString(),
  mode,
  routeFilter: routeFilter || null,
  model: { name: config.model, status: model.status, reason: model.reason || null },
  references,
  pages,
  browser,
  performance,
  findings,
  validationErrors,
  draftCandidates,
  constraints: {
    maxDraftPullRequests: config.maxDraftPullRequests,
    confidenceThreshold: config.confidenceThreshold,
    failClosed: model.status !== "completed" || validationErrors.length > 0 || references.some((reference) => !reference.ok) || browser.status !== "completed" || browser.pages?.some((page) => page.viewports.some((viewport) => viewport.error)) || performance.status !== "completed" || performance.results.some((result) => result.error),
  },
};
await writeJson(path.join(reportDir, "report.json"), report);
await writeJson(path.join(reportDir, "proposals.json"), { runId, proposals: draftCandidates });
await writeFile(path.join(reportDir, "report.md"), reportMarkdown(report));
process.stdout.write(`${JSON.stringify({ reportDir: path.relative(ROOT, reportDir), pages: pages.length, findings: findings.length, draftCandidates: draftCandidates.length, model: model.status }, null, 2)}\n`);

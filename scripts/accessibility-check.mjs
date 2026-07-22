import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT, listDistRoutes } from "./ux-agent/lib.mjs";
import { axeResults, interactionChecks, startDistServer, visit } from "./ux-agent/browser.mjs";

const VIEWPORTS = [390, 1440];
const reportFile = path.join(ROOT, "reports", "accessibility.json");
const routes = await listDistRoutes();
const server = await startDistServer();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const pages = [];

try {
  for (const route of routes) {
    const result = { route, viewports: [] };
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 1000 });
      try {
        await visit(page, `${server.origin}${route}`, { settleMs: 150 });
        result.viewports.push({
          width,
          horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
          axe: await axeResults(page),
          interactions: await interactionChecks(page, width),
        });
      } catch (error) {
        result.viewports.push({ width, error: error.message });
      }
    }
    pages.push(result);
  }
} finally {
  await context.close();
  await browser.close();
  await server.close();
}

const failures = [];
for (const result of pages) {
  for (const viewport of result.viewports) {
    const label = `${result.route} at ${viewport.width}px`;
    if (viewport.error) failures.push(`${label}: browser check failed: ${viewport.error}`);
    if (viewport.horizontalOverflow) failures.push(`${label}: horizontal overflow`);
    for (const violation of viewport.axe || []) {
      failures.push(`${label}: axe ${violation.impact || "unknown"} ${violation.id} (${violation.nodes} ${violation.nodes === 1 ? "node" : "nodes"})`);
    }
    if (viewport.interactions?.mobileToggle === "fail") failures.push(`${label}: mobile navigation keyboard check failed`);
    if (viewport.interactions?.desktopDropdown === "fail") failures.push(`${label}: desktop navigation keyboard check failed`);
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  standard: "WCAG 2.1 AA automated coverage",
  routes: routes.length,
  viewports: VIEWPORTS,
  failures,
  pages,
  manualChecksStillRequired: [
    "Keyboard-only task completion and focus order",
    "Screen-reader reading order and announcements",
    "Content clarity and meaningful alternatives",
    "Zoom, reflow, orientation, and component-state review",
  ],
};
await mkdir(path.dirname(reportFile), { recursive: true });
await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(`${JSON.stringify({ report: path.relative(ROOT, reportFile), routes: routes.length, viewportChecks: routes.length * VIEWPORTS.length, failures: failures.length }, null, 2)}\n`);
if (failures.length) {
  process.stderr.write(`${failures.slice(0, 30).map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exitCode = 1;
}

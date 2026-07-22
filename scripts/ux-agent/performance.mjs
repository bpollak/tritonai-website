import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { chromium } from "playwright";
import { startDistServer } from "./browser.mjs";

const DEFAULT_ROUTES = ["/", "/about/strategy.html", "/skills/index.html", "/tools/index.html"];

function score(category) {
  return Math.round((category?.score || 0) * 100);
}

export async function capturePerformanceAudit({ routeFilter }) {
  const routes = routeFilter ? [routeFilter] : DEFAULT_ROUTES;
  const server = await startDistServer();
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });
  const results = [];
  try {
    for (const route of routes) {
      for (const formFactor of route === "/" ? ["mobile", "desktop"] : ["desktop"]) {
        try {
          const report = await lighthouse(`${server.origin}${route}`, {
            port: chrome.port,
            output: "json",
            onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
            formFactor,
            screenEmulation: formFactor === "mobile"
              ? { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false }
              : { mobile: false, width: 1440, height: 1000, deviceScaleFactor: 1, disabled: false },
          });
          const lhr = report.lhr;
          results.push({
            route,
            formFactor,
            scores: {
              performance: score(lhr.categories.performance),
              accessibility: score(lhr.categories.accessibility),
              bestPractices: score(lhr.categories["best-practices"]),
              seo: score(lhr.categories.seo),
            },
            lcpSeconds: Number(Number((lhr.audits["largest-contentful-paint"]?.numericValue || 0) / 1000).toFixed(2)),
            cls: lhr.audits["cumulative-layout-shift"]?.numericValue || 0,
          });
        } catch (error) {
          results.push({ route, formFactor, error: error.message });
        }
      }
    }
  } finally {
    await chrome.kill();
    await server.close();
  }
  return results;
}

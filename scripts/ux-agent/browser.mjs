import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { ROOT } from "./lib.mjs";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export function screenshotFilename(route, width, suffix = "") {
  const stem = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-").replace(/\.html$/, "");
  return `${stem}-${width}${suffix}.png`;
}

function safeFilePath(distDir, requestPath, basePath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const mounted = decoded === basePath || decoded.startsWith(`${basePath}/`) ? decoded.slice(basePath.length) || "/" : decoded;
  const pathname = mounted === "/" ? "/index.html" : mounted;
  const candidate = path.resolve(distDir, `.${pathname}`);
  if (!candidate.startsWith(`${path.resolve(distDir)}${path.sep}`) && candidate !== path.join(path.resolve(distDir), "index.html")) return null;
  return candidate;
}

export async function startDistServer(distDir = path.join(ROOT, "dist")) {
  const packageName = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8")).name;
  const basePath = `/${packageName}`;
  const server = http.createServer(async (request, response) => {
    const filename = safeFilePath(distDir, request.url || "/", basePath);
    if (!filename) {
      response.writeHead(400).end("Bad request");
      return;
    }
    try {
      const entry = await stat(filename);
      if (!entry.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "content-type": MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream" });
      createReadStream(filename).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

export async function preparePage(page) {
  await page.addStyleTag({
    content: "*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:0.01ms!important}",
  });
  await page.evaluate(() => {
    for (const carousel of document.querySelectorAll(".carousel")) carousel.classList.add("paused");
    for (const video of document.querySelectorAll("video")) video.pause();
  });
}

export async function visit(page, url, { settleMs = 600 } = {}) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(settleMs);
  await preparePage(page);
}

export async function interactionChecks(page, width) {
  const outcome = { mobileToggle: "not-present", desktopDropdown: "not-present" };
  const mobileToggle = page.locator("[data-tritonai-mobile-toggle]").first();
  if (await mobileToggle.count()) {
    const before = await mobileToggle.getAttribute("aria-expanded");
    if (width < 768) await mobileToggle.press("Enter");
    const after = await mobileToggle.getAttribute("aria-expanded");
    const controls = await mobileToggle.getAttribute("aria-controls");
    outcome.mobileToggle = controls === "mobile-navigation" && ["true", "false"].includes(before) && ["true", "false"].includes(after) ? "pass" : "fail";
    if (width < 768 && after === "true") await mobileToggle.press("Escape");
  }
  const dropdown = page.locator("[data-tritonai-nav-dropdown]").first();
  if (await dropdown.count()) {
    await dropdown.focus();
    await dropdown.press("Escape");
    outcome.desktopDropdown = (await dropdown.getAttribute("aria-expanded")) === "false" ? "pass" : "fail";
  }
  return outcome;
}

export async function axeResults(page) {
  const result = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.length,
    targets: violation.nodes.slice(0, 5).map((node) => node.target),
  }));
}

export async function captureBrowserAudit({ config, routes, reportDir, routeFilter }) {
  const selectedRoutes = routeFilter ? routes.filter((route) => route === routeFilter) : routes;
  const representative = config.representativeRoutes.filter((route) => selectedRoutes.includes(route));
  const screenshotsDir = path.join(reportDir, "screenshots");
  const server = await startDistServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const pages = [];
  const references = [];
  try {
    for (const route of selectedRoutes) {
      const dimensions = [390, 1440];
      const pageResult = { route, viewports: [] };
      for (const width of dimensions) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, `${server.origin}${route}`);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
          pageResult.viewports.push({ width, horizontalOverflow: overflow, axe: await axeResults(page), interactions: await interactionChecks(page, width) });
        } catch (error) {
          pageResult.viewports.push({ width, error: error.message });
        }
      }
      pages.push(pageResult);
    }
    for (const route of representative) {
      for (const width of config.breakpoints) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, `${server.origin}${route}`);
          const name = screenshotFilename(route, width);
          await page.screenshot({ path: path.join(screenshotsDir, name), fullPage: true });
          if (width === 992) await page.screenshot({ path: path.join(screenshotsDir, screenshotFilename(route, width, "-viewport")), fullPage: false });
        } catch (error) {
          pages.find((entry) => entry.route === route)?.viewports.push({ width, screenshotError: error.message });
        }
      }
    }
    for (const reference of config.references) {
      const referenceResult = { id: reference.id, url: reference.url, screenshots: [] };
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, reference.url);
          const filename = `reference-${reference.id}-${width}.png`;
          await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
          referenceResult.screenshots.push({ width, filename });
        } catch (error) {
          referenceResult.screenshots.push({ width, error: error.message });
        }
      }
      references.push(referenceResult);
    }
  } finally {
    await context.close();
    await browser.close();
    await server.close();
  }
  return { pages, references };
}

import { readFile } from "node:fs/promises";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function browserRoute(report, route) {
  return report.browser?.pages?.find((page) => page.route === route);
}

function performanceRoute(report, route, formFactor) {
  return report.performance?.results?.find((result) => result.route === route && result.formFactor === formFactor);
}

function axeKeys(page) {
  return new Set((page?.viewports || []).flatMap((viewport) => (viewport.axe || []).map((violation) => `${viewport.width}:${violation.id}`)));
}

const baselineFile = option("--baseline");
const candidateFile = option("--candidate");
const route = option("--route");
if (!baselineFile || !candidateFile || !route) throw new Error("Use --baseline <report.json> --candidate <report.json> --route <route>");
const baseline = JSON.parse(await readFile(baselineFile, "utf8"));
const candidate = JSON.parse(await readFile(candidateFile, "utf8"));
const errors = [];
const baselinePage = browserRoute(baseline, route);
const candidatePage = browserRoute(candidate, route);
if (!candidatePage) errors.push("Candidate route was not captured by the browser audit");
for (const viewport of candidatePage?.viewports || []) {
  if (viewport.error) errors.push(`Browser audit failed at ${viewport.width}px: ${viewport.error}`);
  if (viewport.horizontalOverflow) errors.push(`Horizontal overflow at ${viewport.width}px`);
  if (Object.values(viewport.interactions || {}).includes("fail")) errors.push(`Interaction failure at ${viewport.width}px`);
}
for (const key of axeKeys(candidatePage)) if (!axeKeys(baselinePage).has(key)) errors.push(`New axe violation: ${key}`);
for (const formFactor of ["mobile", "desktop"]) {
  const previous = performanceRoute(baseline, route, formFactor);
  const next = performanceRoute(candidate, route, formFactor);
  if (!next && (formFactor === "desktop" || route === "/")) {
    errors.push(`Missing ${formFactor} Lighthouse result`);
    continue;
  }
  if (!next || next.error) {
    if (next?.error) errors.push(`Lighthouse failed for ${formFactor}: ${next.error}`);
    continue;
  }
  if (previous && !previous.error) {
    for (const category of ["performance", "accessibility", "bestPractices", "seo"]) {
      if (next.scores[category] < previous.scores[category] - 5) errors.push(`${formFactor} ${category} regressed by more than five points`);
      if (previous.scores[category] === 100 && next.scores[category] !== 100) errors.push(`${formFactor} ${category} dropped below the 100 baseline`);
    }
  }
  if (formFactor === "desktop" && next.scores.performance < 90) errors.push("Desktop performance is below 90");
  if (route === "/" && formFactor === "mobile") {
    if (next.scores.performance < 75) errors.push("Mobile homepage performance is below 75");
    if (Number(next.lcpSeconds) > 4.5) errors.push("Mobile homepage LCP exceeds 4.5 seconds");
    if (Number(next.cls) > 0.1) errors.push("Mobile homepage CLS exceeds 0.1");
  }
}
if (errors.length) throw new Error(errors.join("; "));
process.stdout.write("Candidate browser, axe, and Lighthouse checks passed.\n");

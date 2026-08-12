import assert from "node:assert/strict";
import test from "node:test";
import { load } from "cheerio";
import {
  collectTokens,
  deriveProtectedTokens,
  enclosingFunction,
  scanScript,
  scanStylesheet,
  selectorTokens,
  styleRulePreludes,
} from "../scripts/lib/chrome-styling.mjs";

const CSS_FILE = "src/site/_resources/css/agent-site.css";
const JS_FILE = "src/site/_resources/js/site-navigation.js";

// The three tokens the shipped regressions reached for, plus one the canvas
// also uses so the derivation has something to drop.
const tokens = new Set(["#mobile-navigation", ".msearch", ".search-content", ".navmenu-nav", "#chat-bubble"]);

function preludes(css) {
  return [...styleRulePreludes(css)];
}

test("styleRulePreludes reports selectors with the line they start on", () => {
  const css = ".a {\n  color: red;\n}\n\n.b,\n.c {\n  color: blue;\n}\n";
  assert.deepEqual(preludes(css), [
    { prelude: ".a", line: 1 },
    { prelude: ".b,\n.c", line: 5 },
  ]);
});

test("styleRulePreludes skips at-rule preludes but reports the rules inside them", () => {
  const css = "@media (max-width: 767px) {\n  .a { color: red; }\n}\n";
  assert.deepEqual(preludes(css), [{ prelude: ".a", line: 2 }]);
});

test("styleRulePreludes ignores declarations and comments", () => {
  const css = "/* .commented-out { color: red } */\n.a {\n  background: url(x);\n  color: red;\n}\n";
  assert.deepEqual(preludes(css), [{ prelude: ".a", line: 2 }]);
});

test("selectorTokens extracts class and id tokens only", () => {
  assert.deepEqual(
    selectorTokens(".agent-page #mobile-navigation .msearch > li a[data-x='.y']"),
    [".agent-page", "#mobile-navigation", ".msearch"],
  );
});

test("selectorTokens does not read a quoted attribute value as a token", () => {
  assert.deepEqual(selectorTokens('main a[href="#search"]'), []);
});

test("selectorTokens reads attribute selectors on id and class as tokens", () => {
  assert.deepEqual(selectorTokens('[id="search-m"]'), ["#search-m"]);
  assert.deepEqual(selectorTokens('[class~="msearch"]'), [".msearch"]);
});

test("deriveProtectedTokens drops tokens the canvas also uses and adds widget tokens", () => {
  const derived = deriveProtectedTokens({
    chromeTokens: new Set([".navmenu", ".btn", ".container"]),
    canvasTokens: new Set([".btn", ".container"]),
    widgetTokens: ["#chat-bubble"],
  });
  assert.deepEqual([...derived].sort(), [".navmenu", "#chat-bubble"].sort());
});

test("collectTokens reads the node itself and its descendants", () => {
  const $ = load('<div id="mobile-navigation" class="navmenu offcanvas"><span class="msearch"></span></div>');
  const found = collectTokens($, $("#mobile-navigation"));
  assert.deepEqual([...found].sort(), ["#mobile-navigation", ".msearch", ".navmenu", ".offcanvas"].sort());
});

test("scanStylesheet flags a rule reaching into the shell", () => {
  const findings = scanStylesheet(".agent-page #mobile-navigation .msearch form { display: flex; }", CSS_FILE, tokens);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "chrome/styling/stylesheet");
  assert.match(findings[0].issue, /#mobile-navigation/);
  assert.match(findings[0].issue, /\.msearch/);
  assert.equal(findings[0].page, `${CSS_FILE}:1`);
});

test("scanStylesheet flags each offending selector in a list separately", () => {
  const findings = scanStylesheet(".agent-page .msearch .search-scope,\n.agent-page .msearch .search-term { width: 100%; }", CSS_FILE, tokens);
  assert.equal(findings.length, 2);
});

test("scanStylesheet flags a campus widget the page never renders into markup", () => {
  const findings = scanStylesheet("@media (max-width: 767px) {\n  #chat-bubble { width: 52px !important; }\n}", CSS_FILE, tokens);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].page, `${CSS_FILE}:2`);
});

test("scanStylesheet leaves canvas rules alone", () => {
  const css = ".agent-page .agent-card { padding: 20px; }\n.landing-hub-page .hub-split { display: grid; }\n";
  assert.deepEqual(scanStylesheet(css, CSS_FILE, tokens), []);
});

test("scanStylesheet honours a reviewed exception", () => {
  const selector = ".agent-page #mobile-navigation .navbar-toggle[data-tritonai-mobile-close]";
  const allow = new Map([[`${CSS_FILE}::${selector}`, { reason: "layout repair" }]]);
  assert.deepEqual(scanStylesheet(`${selector} { position: absolute; }`, CSS_FILE, tokens, allow), []);
});

test("enclosingFunction names the function a match sits in", () => {
  const source = "function first() {\n  a();\n}\nfunction second() {\n  b.removeAttribute('id');\n}\n";
  assert.equal(enclosingFunction(source, source.indexOf("removeAttribute")), "second");
});

test("scanScript flags id rewriting in a file that touches the shell", () => {
  const source = [
    'function removeDuplicateSearchIds() {',
    '  var search = document.querySelector("nav.navbar .search");',
    '  document.querySelectorAll(".search-content[id]").forEach(function (panel) {',
    '    panel.removeAttribute("id");',
    '  });',
    '}',
  ].join("\n");
  const findings = scanScript(source, JS_FILE, tokens);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "chrome/styling/script");
  assert.match(findings[0].issue, /removeDuplicateSearchIds\(\)/);
  assert.equal(findings[0].page, `${JS_FILE}:4`);
});

test("scanScript ignores a script that never references the shell", () => {
  const source = 'function initializeDrawer(panel, id) {\n  panel.id = id;\n}\n';
  assert.deepEqual(scanScript(source, "src/site/_resources/js/site-drawers.js", tokens), []);
});

test("scanScript honours an exception keyed by function", () => {
  const source = [
    'function removeClonedNavigationIds() {',
    '  document.querySelectorAll(".navmenu-nav [id]").forEach(function (element) {',
    '    element.removeAttribute("id");',
    '  });',
    '}',
  ].join("\n");
  const allow = new Map([[`${JS_FILE}::function:removeClonedNavigationIds`, { reason: "clone cleanup" }]]);
  assert.deepEqual(scanScript(source, JS_FILE, tokens, allow), []);
});

test("scanScript catches assignment and setAttribute as well as removal", () => {
  const source = [
    'function rewrite() {',
    '  document.querySelector(".msearch .search-content").id = "x";',
    '  document.querySelector(".msearch input").setAttribute("id", "y");',
    '}',
  ].join("\n");
  assert.equal(scanScript(source, JS_FILE, tokens).length, 2);
});

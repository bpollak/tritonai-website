import { readFile } from "node:fs/promises";
import path from "node:path";

// Tier 4 of the page chrome integrity gate: site-authored CSS and JavaScript
// may not reach into the Decorator shell.
//
// Tiers 1–3 read markup. Every chrome regression this repository has shipped to
// production got past them because nothing in the markup changed — the shell was
// restyled from src/site/_resources/css/agent-site.css and mutated from
// src/site/_resources/js/site-navigation.js. Three examples, all live at once:
//
//   * `.msearch` overrides rebuilt the drawer search from scratch. They were not
//     breakpoint-scoped, so the drawer kept the custom presentation above 768px
//     where the Decorator switches back to its own.
//   * `#chat-bubble { ... !important }` reshaped the TritonGPT launcher the
//     campus widget renders.
//   * `removeDuplicateSearchIds()` deleted the id `base.min.js` assigns to the
//     drawer search panel below 768px, which is the hook its own stylesheet
//     keys on. The drawer search collapsed, and the CSS above was written to
//     paper over it.
//
// The canvas is not covered here. Styling and scripting `main#main-content` is
// the entire point of the site; this module only draws the line at the shell.
//
// The protected token set is derived, not hand-written: it is every class and
// id that appears inside a chrome region on a built page and nowhere inside the
// canvas. Tokens the canvas also uses drop out automatically, so a Bootstrap
// primitive that a content component starts using stops being protected without
// anyone editing a list.

export const STYLING_POLICY_JSON = path.resolve("config/chrome-styling.json");

// Assigning to these on a chrome element is what breaks the Decorator's own
// responsive behavior. It renames ids across 768px and keys its stylesheet on
// the result, so site code that "cleans up" an id silently removes the hook.
const ID_MUTATION_PATTERNS = [
  { pattern: /\.removeAttribute\(\s*["']id["']\s*\)/g, what: 'removeAttribute("id")' },
  { pattern: /\.setAttribute\(\s*["']id["']\s*,/g, what: 'setAttribute("id", …)' },
  { pattern: /\.id\s*=(?!=)/g, what: "assignment to .id" },
];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

/**
 * Yield every style-rule prelude in a stylesheet with the line it starts on.
 * At-rule preludes (`@media`, `@supports`, `@font-face`) are skipped: they
 * carry conditions, not selectors, and their nested rules are yielded on their
 * own. This is a scanner, not a parser — it needs selector text and a line
 * number, and CSS grammar beyond brace and semicolon structure does not change
 * either one.
 */
export function* styleRulePreludes(css) {
  const text = stripComments(css);
  let buffer = "";
  let line = 1;
  let bufferStartLine = 1;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "\n") line += 1;
    if (character === "{" || character === "}" || character === ";") {
      const prelude = buffer.trim();
      if (character === "{" && prelude && !prelude.startsWith("@")) {
        yield { prelude, line: bufferStartLine };
      }
      buffer = "";
      bufferStartLine = line;
      continue;
    }
    if (!buffer.trim() && character.trim()) bufferStartLine = line;
    buffer += character;
  }
}

/**
 * Class and id tokens a selector targets.
 *
 * Quoted strings are removed before the `.`/`#` scan, so `a[href="#search"]`
 * does not read as targeting `#search`. Attribute selectors on `id` and `class`
 * are then translated back into tokens, so `[id="search-m"]` and
 * `[class~="msearch"]` are caught the same as `#search-m` and `.msearch`.
 */
export function selectorTokens(selector) {
  const tokens = [];
  for (const match of selector.matchAll(/\[\s*(id|class)\s*[~^|*$]?=\s*(["']?)([^\]"']+)\2\s*[isIS]?\s*\]/g)) {
    const prefix = match[1] === "id" ? "#" : ".";
    for (const value of match[3].trim().split(/\s+/)) {
      if (value) tokens.push(`${prefix}${value}`);
    }
  }
  const bare = selector.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, "");
  tokens.push(...(bare.match(/[.#][A-Za-z_][-\w]*/g) || []));
  return tokens;
}

/**
 * Collect every class and id token inside `node`, including on `node` itself.
 */
export function collectTokens($, node, into = new Set()) {
  node.find("*").addBack().each((_, element) => {
    const target = $(element);
    for (const token of (target.attr("class") || "").split(/\s+/)) {
      if (token) into.add(`.${token}`);
    }
    const id = target.attr("id");
    if (id) into.add(`#${id}`);
  });
  return into;
}

/**
 * Tokens that exist only in the shell. A token the canvas also uses is a shared
 * Bootstrap primitive, not a chrome hook, and styling it is the site's business.
 */
export function deriveProtectedTokens({ chromeTokens, canvasTokens, widgetTokens = [] }) {
  const derived = [...chromeTokens].filter((token) => !canvasTokens.has(token));
  return new Set([...derived, ...widgetTokens]);
}

function allowKey(file, selector) {
  return `${file}::${selector.replace(/\s+/g, " ").trim()}`;
}

/**
 * @param {string} css        stylesheet source
 * @param {string} file       repository-relative path, used in the finding
 * @param {Set<string>} tokens protected tokens
 * @param {Map<string, object>} allow keyed by `${file}::${selector}`
 */
export function scanStylesheet(css, file, tokens, allow = new Map()) {
  const findings = [];
  for (const { prelude, line } of styleRulePreludes(css)) {
    for (const selector of prelude.split(",")) {
      const trimmed = selector.replace(/\s+/g, " ").trim();
      if (!trimmed) continue;
      const hits = [...new Set(selectorTokens(trimmed).filter((token) => tokens.has(token)))];
      if (!hits.length) continue;
      const exception = allow.get(allowKey(file, trimmed));
      if (exception) continue;
      findings.push({
        page: `${file}:${line}`,
        rule: "chrome/styling/stylesheet",
        issue: `Site stylesheet targets protected chrome (${hits.join(", ")})`,
        markup: trimmed,
        remedy:
          "The Decorator shell carries its own presentation from cdn.ucsd.edu, including the breakpoint behavior this rule will not follow. Move the rule inside main#main-content, or record a reviewed exception in config/chrome-styling.json.",
      });
    }
  }
  return findings;
}

/**
 * Name of the nearest function declaration or assignment above `index`. Used to
 * anchor an exception to a function rather than to a line of source, so
 * reformatting the body does not silently drop the exception.
 */
export function enclosingFunction(source, index) {
  const before = source.slice(0, index);
  const declarations = [...before.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)];
  const last = declarations.at(-1);
  return last ? last[1] : null;
}

/**
 * Site JavaScript may read the shell and may sync ARIA state on it. It may not
 * rewrite ids: below 768px the Decorator renames the drawer search panel to
 * `#search` and styles it through that id, so removing or reassigning ids on
 * chrome elements takes the shell's own stylesheet off its hook.
 *
 * Only files that reference a protected token are scanned. A script that works
 * entirely inside the canvas assigns ids to its own components all the time —
 * site-drawers.js gives every drawer panel one so the trigger can point
 * `aria-controls` at it — and that is not this rule's business.
 */
export function scanScript(source, file, tokens, allow = new Map()) {
  const referenced = [...tokens].filter((token) => source.includes(token));
  if (!referenced.length) return [];

  const findings = [];
  const lines = source.split("\n");
  for (const { pattern, what } of ID_MUTATION_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      const scope = enclosingFunction(source, match.index);
      if (scope && allow.get(allowKey(file, `function:${scope}`))) continue;
      findings.push({
        page: `${file}:${line}`,
        rule: "chrome/styling/script",
        issue: `Site script rewrites an element id (${what})${scope ? ` in ${scope}()` : ""}`,
        markup: (lines[line - 1] || "").trim(),
        remedy:
          `This file references protected chrome (${referenced.slice(0, 4).join(", ")}). base.min.js renames the drawer search ids across 768px and its stylesheet keys on the result, so rewriting an id here can take the shell off its own hook. Read the shell instead of rewriting it, or record a reviewed exception in config/chrome-styling.json keyed by \`function:${scope ?? "…"}\`.`,
      });
    }
  }
  return findings;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`${path.relative(process.cwd(), file)} is not valid JSON: ${error.message}`);
  }
}

/**
 * Load the exception list. An entry needs a reason and a `reviewOn` date; once
 * that date passes the exception stops applying and reports itself, so a
 * one-time judgement call cannot quietly become permanent.
 */
export async function loadStylingPolicy(today = new Date().toISOString().slice(0, 10)) {
  const policy = await readJson(STYLING_POLICY_JSON);
  const allow = new Map();
  const expired = [];
  for (const entry of policy?.allow ?? []) {
    if (entry.reviewOn && entry.reviewOn < today) {
      expired.push({
        page: "config/chrome-styling.json",
        rule: "chrome/styling/expired-exception",
        issue: `Chrome styling exception for \`${entry.selector}\` in ${entry.file} came up for review on ${entry.reviewOn}`,
        remedy: "Confirm the rule is still needed and set a new reviewOn date, or delete the rule and the exception.",
      });
      continue;
    }
    allow.set(allowKey(entry.file, entry.selector), entry);
  }
  return { allow, expired, widgetTokens: policy?.widgetTokens ?? [] };
}

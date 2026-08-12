# Agent instructions for the TritonAI website

## Mission

Maintain an accessible, static TritonAI website that preserves the public site's current URLs, UC San Diego Decorator presentation, and live browser integrations without requiring Cascade Server.

## Content rules

- Add weekly updates in `content/newsletters/` using the existing filename and frontmatter pattern. Do not hand-edit the rendered newsletter panels in `src/site/index.html` or `src/site/about/ai-updates.html`; the build replaces those panels.
- The article archive on `/about/media-articles.html` and the latest-coverage section on `/about/media.html` are generated from `content/media/articles.json`. Do not hand-edit the generated `<section>` blocks inside `content/pages/about-media-articles.md` or `content/pages/about-media.md` between the `AGENT_SECTION` markers; `npm run render:media` (and the sync job) replace them. Add or correct entries in `content/media/articles.json` instead.
- Edit generated, high-change pages in `content/pages/`, use cases in `content/use-cases/`, roadmap entries in `content/roadmap/`, and reusable public claims in `content/facts/`. The build writes those pages over their matching paths in `dist/`.
- Edit legacy snapshot content at its existing path under `src/site/`. Never rename or remove a public route without an explicit redirect/cutover plan.
- Keep official UCSD Decorator CSS and JavaScript linked to `https://cdn.ucsd.edu/` (or the existing protocol-relative CDN URL). Do not vendor those files for serving. `vendor/decorator-5/` is a pinned read-only copy of the pristine Decorator templates used to derive the chrome contract; it is never copied into `dist/` and never served.
- Keep third-party documents, video, news, and hosted service assets externally linked unless explicitly instructed otherwise.
- Store new TritonAI-owned images and downloads under the matching `_images/`, `_files/`, or `_resources/` path.
- Preserve semantic headings, alternative text, keyboard behavior, and current metadata when editing pages.
- Keep public and internal presentation content separated. Do not publish internal staffing allocations, speculative workforce scenarios, unapproved ROI or accuracy claims, noncommitted dates, sensitive control details, or vendor/tool preference comparisons.
- Quantitative public claims require a definition, owner, source, measurement period, data classification, canonical URL, related slide reference, and current `lastReviewed` date.

## Voice

Full rules and before/after examples: [docs/voice-and-language.md](docs/voice-and-language.md). `npm run test:language` checks the mechanical ones.

- One idea per heading. No two-sentence headings.
- A heading names what the section contains. It is not a maxim.
- No count in a heading when the list is visible below it.
- No manufactured contrast: "X, not Y", "rather than", "instead of".
- Four items maximum in a sentence-level list; more goes in a `<ul>`.
- Cut boosters (`practical`, `trusted`, `meaningful`, `seamless`, `leverage`). Keep the governance vocabulary (`approved`, `bounded`, `supervised`, `named owner`) — those qualify real controls.
- Em dashes only for a genuine aside or a numeric range. Never in a frontmatter `description`.
- Read sibling strings top to bottom. If a set shares an opening frame, rewrite it. A use-case `summary` may not start with "A", "An", or "The".

This applies to agent-authored newsletters in `content/newsletters/` as well as pages.

## Page chrome is not content

Every route shares one UC San Diego Decorator shell. Content goes in the canvas;
the shell around it is pinned and enforced.

**Writable canvas:** `main#main-content`. `renderGeneratedPage()` in
`scripts/build.mjs` injects only there.

**Protected chrome**, on every route: the skip link, the UC emergency container,
the title band, the mobile offcanvas drawer (including its search form), the
desktop navbar (including its search form and the mobile toggle), the footer,
and the TritonGPT widget loader. Run `npm run chrome:explain` for the selectors.

Three checks run inside `npm run validate` and fail the build:

- `chrome/consistent/*` — every route must carry identical chrome.
- `chrome/golden/*` — the chrome must match `config/chrome-contract.json`.
- `chrome/structure/*` — the chrome must satisfy the selector rules in
  `config/chrome-selectors.json`, derived from the pristine templates in
  `vendor/decorator-5/`, plus the site-specific rules in
  `config/chrome-selectors.local.json`.

A golden mismatch is an intentional presentation change once a human has read
the diff: run `npm run chrome:accept` and commit the config diff alongside the
markup change. A structural violation is not acceptable that way —
`chrome:accept` refuses to run while one is outstanding, because regenerating
the golden would record the regression as the new baseline. Restore the markup
from `vendor/decorator-5/templates/` instead.

The full Decorator contract — protected-region markup, component extraction,
navigation, accessibility, security — lives in the `ucsd-decorator` skill in
[`decorator-kit`](https://github.com/UCSD/decorator-kit). Install it
as a Claude Code plugin, or copy `skills/ucsd-decorator/` into `.claude/skills/`
(untracked here). Read it before touching anything outside the canvas.

Two rules that cover how these regressions actually happen:

- **Never reconstruct chrome markup from a rendered DOM or a browser
  inspection.** Read the source file or the vendor template. The offcanvas
  drawer is cloned at runtime by `src/site/_resources/js/site-navigation.js`, so
  the live DOM contains navigation markup that exists in no file.
- **If a task appears to require a chrome change, stop and say so.** Do not
  reshape the shell to make a content change fit.

### If the gate fails

Every failure names its rule. Read the prefix first — it determines what to do,
and two of the three cannot be cleared by regenerating anything.

**`chrome/structure/…`** — the chrome no longer matches the published Decorator.
This is the one that catches a removed search form, an altered widget embed, a
toggle stripped of its icon. `npm run chrome:accept` refuses while one is
outstanding. Restore the markup from the file named in the `Derived from:` line,
usually under `vendor/decorator-5/templates/`. Do not hand-write a replacement
from memory and do not copy it out of a browser.

**`chrome/consistent/…`** — one route's chrome drifted from the rest. The
message names a reference route that still has it right; make the odd one match.
This usually means a shell edit was made without updating the 31 legacy pages
under `src/site/`, so the fix is to finish the edit rather than revert it.

**`chrome/golden/…`** alone, with neither of the above — the shared chrome moved
away from `config/chrome-contract.json`. This is the only failure that can be a
legitimate change: a footer link renamed, a title band adjusted. If a human has
read the diff and wants it:

```bash
npm run chrome:accept
```

Commit the `config/chrome-contract.json` diff in the same change as the markup.
The stored tree keeps that reviewable — the diff shows the node and attribute
that moved, not a hash. An agent may not decide this on its own. Ask the content
owner, quote the diff, and wait for an explicit yes before accepting.

Two things that are never the answer: editing `config/chrome-selectors.json`,
which is generated by `npm run sync:decorator` and overwritten on the next sync,
and adding an entry to `config/chrome-selectors.overrides.json` to silence a
rule. Overrides record a deliberate, dated decision not to adopt an upstream
change, and they expire. They are not a way to pass a build.

Reproduce locally without the full suite:

```bash
npm run build && npm run chrome:check
npm run chrome:explain   # what is protected, and where the canvas starts
```

## Functional integrations

Do not remove the UCSD emergency broadcast, hosted search API, Today@UCSD feed, Google Analytics, or TritonGPT widget without explicit approval. The build patches This Site searches on non-production hosts so they continue querying the `tritonai.ucsd.edu` index.

The build owns the Google Analytics tag. `scripts/build.mjs` strips whatever analytics tag a page carries and injects the canonical one into every route, so the measurement ID lives in one place. To change it, edit `GOOGLE_ANALYTICS_ID` in `scripts/build.mjs` and `googleAnalyticsId` in `scripts/validate.mjs`. Never paste a gtag snippet into a page under `src/site/` or `content/`. `npm run validate` fails on any route missing the injected tag, carrying a different measurement ID, or carrying a hand-authored one. The tag sets `cookie_domain` to `tritonai.ucsd.edu`, so it collects nothing on staging hosts.

The media coverage job (`scripts/sync-media-coverage.mjs`, `npm run sync:media`) searches the public web via DuckDuckGo Lite for coverage of TritonAI and TritonGPT, appends new items to `content/media/articles.json`, and re-renders the archive section of `content/pages/about-media-articles.md` plus the latest-coverage section of `content/pages/about-media.md`. `.github/workflows/sync-media-coverage.yml` runs it weekly and opens a pull request with what it finds; auto-discovered entries carry `discoveredAt` and `discoveredVia` for review. `npm run check:media` runs the search without writing.

## Required validation

Run both deployment modes before proposing a change:

```bash
npm test
SITE_BASE_PATH=/tritonai-website npm run build
SITE_BASE_PATH=/tritonai-website npm run validate
```

`npm test` includes the required site-wide browser accessibility gate. It scans every generated route with axe at mobile and desktop widths, checks horizontal overflow, and exercises shared navigation keyboard behavior. Do not skip or weaken this gate for content-only changes; shared templates and injected modules can affect any route. Automated checks do not replace the required visual, keyboard, focus, zoom/reflow, and screen-reader spot checks for affected components.

Visually inspect affected pages at desktop and responsive breakpoints. For newsletter changes, inspect both `/` and `/about/ai-updates.html`.

The validator intentionally reports the inherited production links below as warnings:

- `/tritongpt/release-notes/5-1-2026-release.html`
- `/technology/ai/tritongpt/release-notes/11-24-2025-release`

Do not add new broken internal targets.

## Crawl safety

`npm run crawl` deletes and recreates `src/site/`. Do not run it for an ordinary content update. Use it only for an explicit whole-site refresh, review `reports/crawl.json`, and preserve intentional repository-authored changes.

## Publishing

Use focused pull requests. Keep generated `dist/` files out of commits; GitHub Actions builds them. A merge to `main` deploys the Pages staging site.

**Never deploy to Vercel.** This repo publishes exclusively through its own pipeline (GitHub Actions → Pages staging on merge to `main`, then a manual confirmed production run from `main`). Do not run the `vercel` CLI, do not push to a Vercel git integration, and do not wire Vercel into this repo — even though a `vercel` CLI happens to be installed on the working machine. Deployment is the content owner's action, never the agent's. When a change is ready, open a PR and stop; review, merge, and publishing belong to the human owner.

### Commit identity

Never pass `-c user.name` or `-c user.email` to `git commit`. The repository and
global git config already resolve to `Cristian Horta <chorta@ucsd.edu>`; let them
apply.

GitHub attributes commits to accounts by email address. `chorta@ucsd.edu` maps to
the `chorta` account. Any other address for this author — in particular
`hortacristian@gmail.com` — maps somewhere else, and the commits land under the
wrong contributor on every repository they reach. Overriding a correct config
with an address taken from conversation context is how that happens.

## Edit Ownership

### Agent-owned (agents may edit freely)
- `content/newsletters/*.md` — weekly AI newsletter content
- `content/media/articles.json` — media article archive (the sync job re-renders `content/pages/about-media-articles.md` from this)
- `src/site/tritongpt/release-notes/*.html` — release notes
- Metrics and usage statistics on any page (clearly marked sections)

### Machine-owned (never hand-edit)
- `vendor/decorator-5/**` — written by `npm run sync:decorator`
- `config/chrome-contract.json` — written by `npm run chrome:accept`
- `config/chrome-selectors.json` — written by `npm run sync:decorator -- --derive`

### Human-owned (agents must PR, never direct commit)
- `src/site/about/index.html` — strategic narrative
- `src/site/about/roadmap.html` — roadmap commitments
- `src/site/about/sustainability.html` — policy content

### Shared (PR required, review by content owner)
- `src/site/index.html` — homepage
- `src/site/tritongpt/index.html` — TritonGPT landing
- `src/site/tools/index.html` — tools listing
- `src/site/developer-apis/index.html` — developer page

## Conflict Prevention

- Always work on a feature branch: `content/update-{page}-{date}`
- Never edit the same section a human is editing (check open PRs first)
- Use HTML comment markers to identify editable blocks:
  `<!-- AGENT_SECTION: metrics -->` ... `<!-- END_AGENT_SECTION -->`
- Run `npm test` and `npm run validate` before every PR
- Keep generated `dist/` files out of commits; GitHub Actions builds them

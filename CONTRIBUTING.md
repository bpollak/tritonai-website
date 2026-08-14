# Contributing to the TritonAI website

This page gets you working. The rules live in [AGENTS.md](AGENTS.md), which is the
contract for this repository. Read it before you touch anything outside page
content.

## Set up

```bash
git clone https://github.com/bpollak/tritonai-website.git
cd tritonai-website
npm install
npx playwright install chromium
npm test
```

Node 22 or newer.

`npx playwright install chromium` is a separate step because npm blocks the
install script that downloads the browser. Skip it and `npm run test:a11y` fails.

`npm test` runs the same suite CI runs: build, validation, the chrome integrity
gate, accessibility at mobile and desktop widths, and the language check. It takes
a few minutes and needs network access, because validation checks the UC San Diego
CDN. A change that passes here passes on the branch.

Preview the built site:

```bash
python3 -m http.server 4173 -d dist
```

## Install the Decorator skill

Cloning the repository gives you every guardrail that rejects a bad change. It
does not give you the guidance for working inside them, because `.claude/` is
git-ignored and the skill lives in another repository.

Install the `ucsd-decorator` skill from
[decorator-kit](https://github.com/UCSD/decorator-kit) as a Claude Code plugin, or
copy `skills/ucsd-decorator/` into your own `.claude/skills/`.

Without it, a chrome violation shows up as a failed build with a rule name and no
explanation of what to do about it. That is when people reach for the config that
generated the rule, which is the one repair that makes the problem permanent.

## Know which branch you are on

The branch is the destination. A push to `main` publishes to
[tritonai.ucsd.edu](https://tritonai.ucsd.edu/) with no approval step, and `main`
carries no branch protection. The full table is in
[README.md](README.md#publishing).

Work on `playground`. It exists to be broken, and pushing there costs nothing.
Moving work to `preview` or `main` is a human decision, because those rungs are
what people look at and what the campus sees.

## The loop

1. Work on `playground`, or branch from `main`.
2. Make the change. High-change pages live in `content/`. Legacy snapshot pages
   stay at their existing path under `src/site/`.
3. Run `npm test`.
4. Run the GitHub Pages path as well, which catches base-path breakage:

   ```bash
   SITE_BASE_PATH=/tritonai-website npm run build
   SITE_BASE_PATH=/tritonai-website npm run validate
   ```

5. Push, then confirm the run rather than assuming it passed:

   ```bash
   gh run watch --exit-status
   ```

6. Look at the rendered page at desktop and mobile widths before promoting.

A red build leaves the branch unpublishable and leaves the previously published
site up. Fix forward on the same branch.

## When the gate fails

Every failure names its rule. Read the prefix first, because two of the three
cannot be cleared by regenerating anything.

```bash
npm run chrome:explain   # what is protected, and where the canvas starts
npm run chrome:check     # reproduce without the full suite
```

- `chrome/structure/*` — restore the markup from the file named in the
  `Derived from:` line, usually under `vendor/decorator-5/templates/`.
- `chrome/styling/*` — move the rule inside `main#main-content`, or delete it and
  let the Decorator's own stylesheet render the region.
- `chrome/consistent/*` — one route drifted from the rest. The message names a
  route that still has it right.
- `chrome/golden/*` alone — the only failure that can be a legitimate change.
  `npm run chrome:accept` records it, and a human decides that, so ask the content
  owner and quote the diff first.

Full triage: [AGENTS.md](AGENTS.md#if-the-gate-fails).

## Never hand-edit these

- `vendor/decorator-5/**`, written by `npm run sync:decorator`
- `config/chrome-contract.json`, written by `npm run chrome:accept`
- `config/chrome-selectors.json`, regenerated on the next sync

Two rules from AGENTS.md that cover how these regressions actually happen:

- Never rebuild chrome markup from a rendered DOM or a browser inspection. The
  mobile drawer is cloned at runtime by `src/site/_resources/js/site-navigation.js`,
  so the live DOM contains navigation markup that exists in no file.
- If a task appears to require a chrome change, stop and say so. Do not reshape
  the shell to make a content change fit.

`npm run crawl` deletes and recreates `src/site/`. It is for an intentional
whole-site refresh only.

## Adding a page outside the Decorator

A self-contained tool or deck that does not use the Decorator shell registers as a
standalone route in four places, and the validator cross-checks them:

| Location | Effect |
|---|---|
| `UNLISTED_ROUTES` in `scripts/build.mjs` | keeps it out of the sitemap and route manifest |
| `standaloneRoutes` in `scripts/validate.mjs` | exempts it from the chrome gate, navigation, and stylesheet checks |
| `STANDALONE_ROUTES` in `scripts/chrome-contract.mjs` | the same exemption for the standalone gate runner |
| the route's entry in `content/seo.json` | carries the `robots` directive |

Files placed under `src/site/` are copied into `dist/` as they are, so no build
rule is needed for the assets.

The `content/seo.json` entry is load-bearing. The build rewrites the `robots` meta
tag on every page from that file, so a page carrying its own `noindex` is
published as indexable when the entry is missing. Nothing catches that today.

The exemption also drops the campus emergency-alert script from the page, which
suits an internal tool and deserves a second look for anything linked publicly.

## Where the rest is written down

| Topic | File |
|---|---|
| The contract: chrome, ownership, voice, publishing | [AGENTS.md](AGENTS.md) |
| What the project is, and its architecture | [README.md](README.md) |
| Voice rules with before and after examples | [docs/voice-and-language.md](docs/voice-and-language.md) |
| Content governance and required fields | [docs/content-governance.md](docs/content-governance.md) |
| How updates reach the site | [docs/how-updates-and-publishing-work.md](docs/how-updates-and-publishing-work.md) |

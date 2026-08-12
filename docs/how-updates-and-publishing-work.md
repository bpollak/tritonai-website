# How website updates and publishing work

This guide explains, in plain language, how changes move from an idea to the live TritonAI website. It is written for anyone who edits, reviews, or approves site content — no technical background required.

## The short version

You write or edit content in the repository. An automated build turns it into finished web pages. A pull request lets someone review the change. Merging the request updates source control, but it does not publish to Cascade. Review previews and production publishing are separate workflows. An authorized maintainer starts production publishing after approval. Some updates — newsletters, media coverage, and the skills catalog — can also be found and proposed by scheduled jobs.

## Where content lives

- **Pages people read often** — the homepage, strategy, trust architecture, tools, and similar hubs — live as Markdown files in `content/pages/`. You edit the words here, not the final HTML.
- **Use cases** — real campus AI workflows — live in `content/use-cases/`. Each one carries a status (Production, Shipped, Pilot, In development, or Exploring), an owner, and a review date.
- **Weekly AI updates** live in `content/newsletters/` as one Markdown file per week.
- **Media coverage** lives in `content/media/articles.json`. The article archive page and the latest-coverage section on the media page are generated from this file.
- **Roadmap, facts, and skills** live in `content/roadmap/`, `content/facts/`, and `content/skills/`.
- **The visual shell** — the UC San Diego Decorator header, footer, styles, and scripts — lives in `src/site/` and loads from the UCSD CDN. You almost never need to touch it.

If a file lives under `content/`, you edit the source. The build writes the final page. If a file lives under `src/site/`, it is a legacy page kept at its original public address and edited directly.

## How a change becomes a web page

1. **You make the change** in the right content file — for example, adding a newsletter in `content/newsletters/` or fixing a sentence in `content/pages/about-strategy.md`.
2. **The build runs.** `scripts/build.mjs` reads every content file, applies the shared Decorator shell, injects the Google Analytics tag, and writes finished HTML, a sitemap, and a robots file into `dist/`. You never commit `dist/` — GitHub builds it fresh each time.
3. **The validator checks the result.** `scripts/validate.mjs` confirms that every route exists, internal links resolve, metadata is present, analytics tags are correct, and pages are not stale (it warns after 120 days without review and fails after 365).
4. **Accessibility and language checks run.** An axe-based scan tests every page at mobile and desktop widths. A language check flags booster words, manufactured contrasts, and heading problems.
5. **You open a pull request.** A reviewer sees what changed before it goes live.
6. **Merge to `main` prepares the source.** GitHub Pages review publishing and Cascade production publishing remain separate actions.

## The pull request workflow

The branch you push to is the site you publish to. There are three, and each one
is a rehearsal for the next.

| Branch | Goes live at | What it is for |
|---|---|---|
| `playground` | the GitHub Pages site | Trying something. Break it freely; nobody outside the team sees it. |
| `preview` | Cascade **Stage** | The real CMS. Check how the page actually renders. |
| `main` | **tritonai.ucsd.edu** | The public site. |

Pushing is all it takes. There is no button to press and no approval to wait
for.

A pull request is not required. Reviewing a diff is not how this site gets
checked — what matters is how the finished page looks, so the useful review
happens on `playground` or `preview`, not in a code comparison. Open a PR when
two people are working on the same page and need to avoid overwriting each
other.

- Keep generated `dist/` files out of commits. GitHub builds them.
- Move work up a rung only when the page reads correctly on the rung below.

### What stops a bad change

Every push runs the full check suite: the build, link and metadata validation,
the page chrome gate, an accessibility scan, and the voice guide. **If any of it
fails, nothing is uploaded** and the site that is already live stays exactly as
it was.

The failure does not undo the commit, so that branch stays unpublishable until
someone fixes it. Fix it on the same branch rather than leaving it broken.

The **Publish to Cascade** workflow can still be started by hand for a re-run or
a one-off override. Started that way against `main`, it asks for **confirm
production** first, because a manual production run is the case where someone
may not have meant to. A push to `main` is already that decision.

Some pages are owned by people and require their review before merge — for example, the strategic narrative, roadmap, and sustainability policy. Others, like newsletters and release notes, agents may edit freely. The `AGENTS.md` file in the repository lists who owns what.

## How multiple contributors work together

The site is built for more than one person or agent editing at the same time. The mechanics below keep concurrent work from colliding and make each person's scope clear.

### Branching

Every contributor — human or agent — works on their own feature branch, never directly on `main`. The branch name describes the work:

- `content/update-strategy-2026-07-30` for a page edit
- `content/newsletter-2026-07-27` for a weekly update
- `automation/sync-ai-news` for an automated job's PR

This means two people can edit different parts of the site at the same time without overwriting each other. Each branch becomes a PR, and `main` only receives changes through a merge.

### Edit ownership

Not every file is fair game for every contributor. `AGENTS.md` defines three tiers:

- **Agent-owned** — newsletters, the media article archive (`content/media/articles.json`), release notes, and clearly marked metrics sections. Agents may edit these freely and open PRs without a content owner's sign-off.
- **Human-owned** — the strategic narrative (`src/site/about/index.html`), roadmap (`src/site/about/roadmap.html`), and sustainability policy (`src/site/about/sustainability.html`). Agents must open a PR but never direct-commit; the content owner reviews before merge.
- **Shared** — the homepage, TritonGPT landing, tools listing, and developer page. A PR is required and the content owner reviews.

When a human and an agent are both editing the site, the agent checks open PRs first and avoids editing the same section a human is already changing.

### Section markers

Generated or agent-managed regions inside a file are wrapped in HTML comment markers:

```
<!-- AGENT_SECTION: metrics -->
...generated content...
<!-- END_AGENT_SECTION -->
```

A human editing the same file can safely change anything outside the markers. The build or sync job replaces only what is inside them. This lets a person and an automation edit the same file without clobbering each other's work.

### Avoiding conflicts

- **Check open PRs before starting.** If someone already has a PR open that touches the same file or section, coordinate before branching.
- **Keep PRs focused.** One PR per page or per task. A PR that changes one newsletter is easy to review and merge; a PR that changes ten files across four sections is not.
- **Pull `main` before merging.** If `main` has moved since the branch was created, rebase or merge `main` into the branch and re-run `npm test` so the checks run against the latest state.
- **Stage only the files you intended.** In a worktree with unrelated edits, stage only the files your PR is about. Leave stray files alone.

### Who reviews what

| File or area | Who can edit | Who reviews before merge |
| --- | --- | --- |
| Newsletters, release notes, media archive, metrics | Agents and people | Any maintainer |
| Strategic narrative, roadmap, sustainability | PR only, never direct commit | Content owner |
| Homepage, TritonGPT landing, tools, developer page | PR required | Content owner |
| Automated job PRs (`automation/sync-*`) | The job opens the PR | A person merges |

### How an automated job and a person overlap

The automated jobs (newsletter sync, media search, skills refresh) run on schedules and open their own PRs. If a person is also editing a newsletter or the media archive at the same time:

1. The job's PR and the person's PR are on separate branches.
2. The job never force-pushes to a person's branch — it pushes only to its own `automation/sync-*` branch.
3. If both PRs touch the same file, GitHub flags a merge conflict when the second one is merged. Rebase the second branch onto `main`, resolve the conflict, and re-run `npm test`.
4. Because the job is idempotent, re-running it after a merge produces a clean result with no duplicates.

## Automated content jobs

Three scheduled jobs find and add content without a person doing it by hand. Each opens a pull request — a human still reviews and merges before anything goes live. None of these jobs publish directly.

### Quick reference

| Job | What it does | Schedule | Script | PR branch |
| --- | --- | --- | --- | --- |
| Weekly AI newsletter sync | Pulls new newsletter editions from the external newsletter source | Mondays 18:15 UTC | `scripts/sync-ai-news.mjs` | `automation/sync-ai-news` |
| Media coverage search | Searches the web for TritonAI and TritonGPT articles and adds them to the archive | Mondays 18:30 UTC | `scripts/sync-media-coverage.mjs` | `automation/sync-media-coverage` |
| Skills Library refresh | Updates the public skills catalog from the upstream GitHub repository | Hourly at :17 and before every build | `scripts/sync-skills.mjs` | Builds in place; no PR |

All three can also be started manually from the GitHub Actions tab.

### Weekly AI newsletter sync

**What it does:** Fetches newsletter editions from the external source at `brettcpollak.com/ucsd-ai-news`, sanitizes the HTML, converts it to Markdown, and writes one file per edition into `content/newsletters/`.

**When it runs:** Every Monday at 18:15 UTC, or on demand from the Actions tab.

**What it changes:** Files in `content/newsletters/`. The homepage and `/about/ai-updates.html` pick up the newest entries automatically at build time.

**How a new edition reaches the site:**

1. The job fetches the source page and extracts each newsletter edition.
2. It compares each edition against the file already in the repository. If nothing changed, it stops.
3. If there is a new or updated edition, it writes the Markdown file, runs the full `npm test` suite, and force-pushes the `automation/sync-ai-news` branch.
4. It opens or refreshes a pull request titled "Sync UC San Diego AI Weekly."
5. A reviewer merges the PR. The merge triggers the standard build and deploy.

**Run it locally:**

```bash
npm run sync:ai-news      # fetch and write
npm run check:ai-news     # fetch only, exit 1 if changes are pending
```

### Media coverage search

**What it does:** Searches the public web via DuckDuckGo Lite for articles mentioning TritonAI or TritonGPT, filters out first-party `ucsd.edu` pages and social-media sites, extracts a publish date and publisher name from each article page, and appends new items to `content/media/articles.json`. It then regenerates the article archive on `/about/media-articles.html` and the latest-coverage section on `/about/media.html` from that JSON.

**When it runs:** Every Monday at 18:30 UTC, or on demand from the Actions tab.

**What it changes:** `content/media/articles.json` and the generated section blocks inside `content/pages/about-media-articles.md` and `content/pages/about-media.md`. Curated sections on the media page — featured coverage, awards, appearances, and reports — are never touched by the job.

**How a discovered article reaches the site:**

1. The job runs each search query from the `queries` array in `articles.json`.
2. It filters results for relevance (title or snippet must mention TritonGPT, TritonAI, or UC San Diego alongside AI) and drops blocked hosts.
3. It normalizes URLs — stripping tracking parameters — and skips any URL already in the archive.
4. For each new URL, it fetches the article page and extracts a publish date from JSON-LD, Open Graph metadata, or a `YYYY/MM/DD` URL pattern.
5. It adds the article to the matching year section in the JSON, re-renders both pages, runs `npm test`, and force-pushes the `automation/sync-media-coverage` branch.
6. It opens or refreshes a pull request titled "Add discovered TritonAI / TritonGPT media coverage."
7. A reviewer checks the discovered items (each tagged with `discoveredAt` and `discoveredVia`) and merges the PR.

**What the job never does:** It never deletes a curated entry, never promotes an item to the featured grid, and never publishes without a merge.

**Run it locally:**

```bash
npm run sync:media        # search and write
npm run check:media       # search only, exit 1 if new items are pending
npm run render:media      # regenerate both pages from JSON without searching
```

### Skills Library refresh

**What it does:** Reads the public UCSD Skills Library repository via the GitHub API and writes a build-safe snapshot to `content/skills/library.json`. This keeps the public skills catalog current without committing every upstream change by hand.

**When it runs:** Hourly at :17 UTC as part of the main Pages workflow, before every build, and whenever a `skills-library-updated` repository dispatch event fires. It also runs on every pull request and push to `main`.

**What it changes:** `content/skills/library.json`. Unlike the other two jobs, this one does not open a pull request — it refreshes the snapshot in place during the build. The committed file keeps builds deterministic if GitHub is temporarily unreachable.

**Run it locally:**

```bash
npm run sync:skills
```

### What every job has in common

- **A human reviews before publish.** The newsletter and media jobs open pull requests. The skills job refreshes a data file that the build reads, but the catalog itself is not a curated narrative.
- **The full test suite runs.** Before any PR is opened, `npm test` runs the build, validator, accessibility gate, language check, and unit tests. If any check fails, the PR is not opened.
- **Generated `dist/` is never committed.** GitHub builds it fresh on deploy.
- **Each job is idempotent.** Running it twice with the same source produces the same output. If there is nothing new, the job exits without opening a PR.
- **Each job can run on demand.** Use the GitHub Actions tab to trigger any of them outside the schedule.

### Adding or changing a search query

The media coverage job reads its search queries from the `queries` array in `content/media/articles.json`. To search for a different or additional term, edit that array and open a PR. The next scheduled run — or a manual run from the Actions tab — will use the new queries.

### Disabling a job

Remove the `on: schedule` block from the workflow file. The `workflow_dispatch` trigger lets you still run it manually from the Actions tab. Do not delete the workflow file unless you intend to retire the automation permanently.

## How to publish a weekly update

1. Add a file in `content/newsletters/` named `ucsd-ai-newsletter-YYYY-MM-DD.md`.
2. Include frontmatter with the title, date, source filename, and item count.
3. Write the newsletter body in Markdown.
4. Run `npm test` locally.
5. Open a PR. Merging updates source control. Production requires the separate manual Cascade workflow.

You do not need to edit the homepage or the AI updates page by hand — the build places the three newest newsletters on the homepage and all of them on `/about/ai-updates.html`.

## How to update a regular page

1. Open the matching file in `content/pages/` — for example, `content/pages/about-strategy.md` for the strategy page.
2. Edit the Markdown body. Keep the frontmatter (title, description, review date, audiences) current.
3. Run `npm test`.
4. Open a PR.

## Checks that must pass

Before any change merges, the full `npm test` suite runs. It chains the steps below in order: unit tests, build, validate, accessibility, and language. If any step fails, the PR cannot merge.

### Unit tests

Run first, before the build, so a broken helper never reaches a generated page.

- **UX-agent helpers** — nine tests covering the helpers that audit and draft UX findings.
- **Newsletter sync** — tests that the sync parses source markup, sanitizes links, and rejects empty editions.
- **Media coverage sync** — nine tests covering URL deduplication, year-section insertion, rendering, markdown rewriting, relevance filtering, and the end-to-end discover flow with an injected search.

### Build

`scripts/build.mjs` produces `dist/` with the GitHub Pages base path. It:

- Reads every Markdown page, use case, newsletter, roadmap milestone, fact, and skill entry.
- Applies the shared UC San Diego Decorator shell to each generated page.
- Injects the one canonical Google Analytics tag into every route and strips any hand-authored tag a page carried.
- Writes finished HTML, `sitemap.xml`, `robots.txt`, `_data/routes.json`, and `_data/public-content.json`.

You never commit `dist/`. GitHub builds it fresh on every deploy.

### Validation

`scripts/validate.mjs` reads the built `dist/` directory and writes `reports/validation.json`. It fails the build if any of these checks find a problem:

- **Content schema** — every page, use case, roadmap milestone, fact, gateway-usage metric, skill, and hero slide must carry its required fields (owner, source, review date, audience, status, data classification, and more). Unknown statuses and duplicate names are rejected.
- **Broken links** — every internal `href` and `src` must resolve to a file in `dist/`. Two inherited production broken links are preserved as warnings only; no new broken targets are allowed.
- **Remote dependencies** — the UCSD Decorator stylesheets and scripts, emergency broadcast, search API, TritonGPT widget, and Today@UCSD feed must all respond over HTTPS.
- **Freshness** — each page, use case, fact, roadmap milestone, and skill snapshot carries a `lastReviewed` date. The validator warns after 120 days and fails after 365. The skills snapshot fails if it is older than 14 days.
- **Metadata** — every page must have a canonical URL, title, description, Open Graph tags (title, description, URL, site name, image, image alt), a large-image Twitter card, robots directives, and valid JSON-LD.
- **Analytics** — every page must carry exactly one build-injected Google Analytics tag using the canonical measurement ID, loaded asynchronously. A hand-authored tag fails.
- **Navigation** — primary navigation must be present, the active item must match the page's section, desktop dropdowns and mobile and search toggles must use valid ARIA relationships, and duplicate element IDs are rejected.
- **Accessibility (markup-level)** — positive `tabindex` values, label targets that are missing or duplicated, and labels not in the same form as their control all fail.
- **Decorator conformance** — every page must link the official Decorator 5 stylesheets, carry the shared extension class, avoid inline font-family overrides, and use the Decorator panel component for custom cards.
- **Performance** — videos must defer loading (no eager autoplay, `preload=none`, sources in `data-src`), YouTube embeds must lazy-load, every external origin needs a `preconnect`, Decorator scripts must run after render, the emergency broadcast and TritonGPT widget must not block rendering, images over 320 KB must offer a WebP source, and the performance runtime must be present and deferred.
- **Routes and sitemap** — the route manifest count must match the HTML file count, every indexable route must appear in `sitemap.xml`, non-indexable routes must not, and `404.html` and `robots.txt` must exist.
- **Retired content** — rendered pages must not link to the retired workgroup route or expose internal filenames, presentation-deck framing, or other behind-the-scenes language.

### Accessibility scan

`scripts/accessibility-check.mjs` opens every non-redirect route in headless Chromium at two widths — 390 px (mobile) and 1440 px (desktop) — and runs axe-core plus interaction checks:

- **axe-core** — WCAG-level automated checks for color contrast, landmarks, headings, labels, names, and ARIA correctness.
- **Horizontal overflow** — the page must not scroll sideways at either width.
- **Collapsed hub media** — at mobile widths, side-by-side hub media must not collapse to a sliver.
- **Button size mismatches** — adjacent buttons on the same row must be the same size.
- **Keyboard behavior** — shared navigation dropdowns, toggles, and search controls must respond to keyboard focus and activation.

Results are written to `reports/accessibility.json` and uploaded as a GitHub Actions artifact that stays for 30 days.

### Language check

`scripts/language-check.mjs` reads the Markdown sources in `content/` (not the built HTML) so a finding names the file an editor would open. It flags:

- **Heading sentence breaks** — a heading with two sentences reads as a slogan; say one thing.
- **Count in a heading** — when the list is visible below, the count is redundant.
- **Manufactured contrast** — "X, not Y", "rather than", "instead of" in headings and body copy.
- **Booster adjectives** — words like "practical", "trusted", "seamless", "leverage" that do no work. Governance vocabulary ("approved", "bounded", "supervised", "named owner") is never flagged.
- **Long comma lists** — five or more items in one sentence should become a list element.
- **Em dashes outside numeric ranges** — use a period, comma, or conjunction instead.
- **Repeated opening frames** — when sibling strings (headings, summaries, kickers) all start the same way, the check names the set so an editor can vary them.
- **Description length** — frontmatter `description` values must stay under 155 characters and must not contain an em dash.

Warnings do not fail the build; errors do. A `<!-- lang-ok: reason -->` comment suppresses a finding on the next line and stays visible in a diff for review.

### Automated checks do not replace manual review

After changing a page, look at it at desktop and responsive widths. Confirm headings, links, and keyboard focus behave. Automated checks catch structural and markup problems; they cannot judge whether a page reads well or communicates its purpose.

## What never gets committed

- The `dist/` directory. GitHub builds it on every deploy.
- Hand-pasted Google Analytics snippets. The build injects the one canonical tag into every route.
- Internal staffing details, unapproved metrics, speculative dates, or vendor comparisons. The content governance guide in `docs/content-governance.md` defines what stays out.

## Quick reference

| Task | Where to edit | How to publish |
| --- | --- | --- |
| Weekly AI update | `content/newsletters/` | PR to `main` |
| Strategy, trust, tools, or other page | `content/pages/` | PR to `main` |
| Use case | `content/use-cases/` | PR to `main` |
| Roadmap status | `content/roadmap/milestones.json` | PR to `main` |
| Media coverage | `content/media/articles.json` | PR, or the weekly search job opens one |
| Navigation menu | `content/site.json` | PR to `main` |
| Skills catalog | `content/skills/library.json` | Refreshed automatically |

## Further reading

- [Content governance](content-governance.md) — what may be published and what stays out
- [Voice and language](voice-and-language.md) — how the site should read
- [Deck synchronization](deck-synchronization.md) — how presentation decks stay aligned with the site
- [Skills Library sync](skills-library-sync.md) — how the skills catalog refreshes
- [Search cutover plan](search-cutover.md) — how site search moved with the migration

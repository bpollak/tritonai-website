# How website updates and publishing work

This guide explains, in plain language, how changes move from an idea to the live TritonAI website. It is written for anyone who edits, reviews, or approves site content — no technical background required.

## The short version

You write or edit content in the repository. An automated build turns it into finished web pages. A pull request lets someone review the change. When the request is merged into `main`, GitHub publishes the site automatically. Some updates — newsletters, media coverage, and the skills catalog — can also be found and added by scheduled jobs without a person doing it by hand.

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
6. **Merge to `main` publishes.** GitHub Actions builds the site with the Pages base path and deploys it. No manual upload, no Cascade Server.

## The pull request workflow

Every change goes through a pull request (PR). This keeps a record of who changed what and gives a human a chance to review before publishing.

- Work on a branch named for what you are doing, such as `content/update-strategy-2026-07-30`.
- Open the PR against `main`.
- The same build, validate, accessibility, and language checks that run locally also run in GitHub Actions on the PR. They must pass before merge.
- When you merge, GitHub Pages deploys automatically within a minute or two.
- Keep generated `dist/` files out of commits. GitHub builds them.

Some pages are owned by people and require their review before merge — for example, the strategic narrative, roadmap, and sustainability policy. Others, like newsletters and release notes, agents may edit freely. The `AGENTS.md` file in the repository lists who owns what.

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
5. Open a PR. Merging to `main` deploys.

You do not need to edit the homepage or the AI updates page by hand — the build places the three newest newsletters on the homepage and all of them on `/about/ai-updates.html`.

## How to update a regular page

1. Open the matching file in `content/pages/` — for example, `content/pages/about-strategy.md` for the strategy page.
2. Edit the Markdown body. Keep the frontmatter (title, description, review date, audiences) current.
3. Run `npm test`.
4. Open a PR.

## Checks that must pass

Before any change merges, the full `npm test` suite runs:

- **Build** — produces `dist/` with the GitHub Pages base path.
- **Validate** — checks routes, links, metadata, analytics, freshness, and JSON-LD.
- **Accessibility** — scans every page with axe at mobile and desktop widths, checks keyboard navigation, and flags horizontal overflow.
- **Language** — flags booster words, manufactured contrasts, count-in-heading issues, and long sentence-level lists.
- **Unit tests** — cover the newsletter sync, media coverage sync, and UX-agent helpers.

Automated checks do not replace visual and keyboard spot-checks. After changing a page, look at it at desktop and responsive widths and confirm headings, links, and keyboard focus behave.

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

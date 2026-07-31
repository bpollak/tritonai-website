# Automated content jobs

Three scheduled jobs find and add content without a person doing it by hand. Each job opens a pull request — a human still reviews and merges before anything goes live. None of these jobs publish directly.

## Quick reference

| Job | What it does | Schedule | Script | Workflow file | PR branch |
| --- | --- | --- | --- | --- | --- |
| Weekly AI newsletter sync | Pulls new newsletter editions from the external newsletter source | Mondays 18:15 UTC | `scripts/sync-ai-news.mjs` | `.github/workflows/sync-ai-news.yml` | `automation/sync-ai-news` |
| Media coverage search | Searches the web for TritonAI and TritonGPT articles and adds them to the archive | Mondays 18:30 UTC | `scripts/sync-media-coverage.mjs` | `.github/workflows/sync-media-coverage.yml` | `automation/sync-media-coverage` |
| Skills Library refresh | Updates the public skills catalog from the upstream GitHub repository | Hourly at :17 and before every build | `scripts/sync-skills.mjs` | `.github/workflows/pages.yml` | Builds in place; no PR |

All three can also be started manually from the GitHub Actions tab (`workflow_dispatch`).

## Weekly AI newsletter sync

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

**Source:** `scripts/sync-ai-news.mjs`

## Media coverage search

**What it does:** Searches the public web via DuckDuckGo Lite for articles mentioning TritonAI or TritonGPT, filters out first-party `ucsd.edu` pages and social-media sites, extracts a publish date and publisher name from each article page, and appends new items to `content/media/articles.json`. It then regenerates the article archive on `/about/media-articles.html` and the latest-coverage section on `/about/media.html` from that JSON.

**When it runs:** Every Monday at 18:30 UTC, or on demand from the Actions tab.

**What it changes:** `content/media/articles.json` and the generated `<section>` blocks inside `content/pages/about-media-articles.md` and `content/pages/about-media.md`. Curated sections on the media page — featured coverage, awards, appearances, and reports — are never touched by the job.

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

**Source:** `scripts/sync-media-coverage.mjs`, with rendering helpers in `scripts/lib/media-articles.mjs`

## Skills Library refresh

**What it does:** Reads the public [UCSD Skills Library](https://github.com/dbalders/UCSD-Skills-Library) repository via the GitHub API and writes a build-safe snapshot to `content/skills/library.json`. This keeps the public skills catalog current without committing every upstream change by hand.

**When it runs:** Hourly at :17 UTC as part of the main Pages workflow, before every build, and whenever a `skills-library-updated` repository dispatch event fires. It also runs on every pull request and push to `main`.

**What it changes:** `content/skills/library.json`. Unlike the other two jobs, this one does not open a pull request — it refreshes the snapshot in place during the build. The committed file keeps builds deterministic if GitHub is temporarily unreachable.

**Run it locally:**

```bash
npm run sync:skills
```

**Source:** `scripts/sync-skills.mjs`

## What every job has in common

- **A human reviews before publish.** The newsletter and media jobs open pull requests. The skills job refreshes a data file that the build reads, but the catalog itself is not a curated narrative.
- **The full test suite runs.** Before any PR is opened, `npm test` runs the build, validator, accessibility gate, language check, and unit tests. If any check fails, the PR is not opened.
- **Generated `dist/` is never committed.** GitHub builds it fresh on deploy.
- **Each job is idempotent.** Running it twice with the same source produces the same output. If there is nothing new, the job exits without opening a PR.
- **Each job can run on demand.** Use the GitHub Actions tab to trigger any of them outside the schedule.

## How to add or change a search query

The media coverage job reads its search queries from the `queries` array in `content/media/articles.json`. To search for a different or additional term, edit that array and open a PR. The next scheduled run — or a manual run from the Actions tab — will use the new queries.

## How to disable a job

Set the workflow file's schedule cron to a disabled comment, or remove the `on: schedule` block. The `workflow_dispatch` trigger lets you still run it manually from the Actions tab. Do not delete the workflow file unless you intend to retire the automation permanently.

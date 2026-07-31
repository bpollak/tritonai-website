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

## Automated jobs

Three scheduled jobs find and add content without a person doing it by hand. Each opens a pull request so a human still reviews before anything goes live.

- **Weekly AI newsletter sync** — runs every Monday, pulls new newsletter editions from the external newsletter source into `content/newsletters/`, and opens a PR.
- **Media coverage search** — runs every Monday, searches the public web via DuckDuckGo for articles about TritonAI or TritonGPT, adds new items to `content/media/articles.json`, regenerates the article archive and latest-coverage sections, and opens a PR. Discovered items are tagged with the date and source so a reviewer can see what the search found.
- **Skills Library refresh** — runs hourly and before every build, updating `content/skills/library.json` from the upstream GitHub repository so the public skills catalog stays current.

None of these jobs publish directly. They open or refresh a PR, and a person merges it.

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

- [Automated content jobs](automated-content-jobs.md) — the scheduled jobs that find and add content automatically
## Further reading

- [Content governance](content-governance.md) — what may be published and what stays out
- [Voice and language](voice-and-language.md) — how the site should read
- [Deck synchronization](deck-synchronization.md) — how presentation decks stay aligned with the site
- [Skills Library sync](skills-library-sync.md) — how the skills catalog refreshes
- [Search cutover plan](search-cutover.md) — how site search moved with the migration

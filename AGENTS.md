# Agent instructions for the TritonAI website

## Mission

Maintain an accessible, static TritonAI website that preserves the public site's current URLs, UC San Diego Decorator presentation, and live browser integrations without requiring Cascade Server.

## Content rules

- Add weekly updates in `content/newsletters/` using the existing filename and frontmatter pattern. Do not hand-edit the rendered newsletter panels in `src/site/index.html` or `src/site/about/ai-updates.html`; the build replaces those panels.
- Edit generated, high-change pages in `content/pages/`, use cases in `content/use-cases/`, roadmap entries in `content/roadmap/`, and reusable public claims in `content/facts/`. The build writes those pages over their matching paths in `dist/`.
- Edit legacy snapshot content at its existing path under `src/site/`. Never rename or remove a public route without an explicit redirect/cutover plan.
- Keep official UCSD Decorator CSS and JavaScript linked to `https://cdn.ucsd.edu/` (or the existing protocol-relative CDN URL). Do not vendor those files.
- Keep third-party documents, video, news, and hosted service assets externally linked unless explicitly instructed otherwise.
- Store new TritonAI-owned images and downloads under the matching `_images/`, `_files/`, or `_resources/` path.
- Preserve semantic headings, alternative text, keyboard behavior, and current metadata when editing pages.
- Keep public and internal presentation content separated. Do not publish internal staffing allocations, speculative workforce scenarios, unapproved ROI or accuracy claims, noncommitted dates, sensitive control details, or vendor/tool preference comparisons.
- Quantitative public claims require a definition, owner, source, measurement period, data classification, canonical URL, related slide reference, and current `lastReviewed` date.

## Functional integrations

Do not remove the UCSD emergency broadcast, hosted search API, Today@UCSD feed, Google Analytics, or TritonGPT widget without explicit approval. The build patches This Site searches on non-production hosts so they continue querying the `tritonai.ucsd.edu` index.

## Required validation

Run both deployment modes before proposing a change:

```bash
npm test
SITE_BASE_PATH=/tritonai-website npm run build
SITE_BASE_PATH=/tritonai-website npm run validate
```

Visually inspect affected pages at desktop and responsive breakpoints. For newsletter changes, inspect both `/` and `/about/ai-updates.html`.

The validator intentionally reports the inherited production links below as warnings:

- `/tritongpt/release-notes/5-1-2026-release.html`
- `/technology/ai/tritongpt/release-notes/11-24-2025-release`

Do not add new broken internal targets.

## Crawl safety

`npm run crawl` deletes and recreates `src/site/`. Do not run it for an ordinary content update. Use it only for an explicit whole-site refresh, review `reports/crawl.json`, and preserve intentional repository-authored changes.

## Publishing

Use focused pull requests. Keep generated `dist/` files out of commits; GitHub Actions builds them. A merge to `main` deploys the Pages staging site.

## Edit Ownership

### Agent-owned (agents may edit freely)
- `content/newsletters/*.md` — weekly AI newsletter content
- `src/site/tritongpt/release-notes/*.html` — release notes
- Metrics and usage statistics on any page (clearly marked sections)

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

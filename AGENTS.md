# Agent instructions for the TritonAI website

## Mission

Maintain an accessible, static TritonAI website that preserves the public site's current URLs, UC San Diego Decorator presentation, and live browser integrations without requiring Cascade Server.

## Content rules

- Add weekly updates in `content/newsletters/` using the existing filename and frontmatter pattern. Do not hand-edit the rendered newsletter panels in `src/site/index.html` or `src/site/about/ai-updates.html`; the build replaces those panels.
- Edit other page content at its existing path under `src/site/`. Never rename or remove a public route without an explicit redirect/cutover plan.
- Keep official UCSD Decorator CSS and JavaScript linked to `https://cdn.ucsd.edu/` (or the existing protocol-relative CDN URL). Do not vendor those files.
- Keep third-party documents, video, news, and hosted service assets externally linked unless explicitly instructed otherwise.
- Store new TritonAI-owned images and downloads under the matching `_images/`, `_files/`, or `_resources/` path.
- Preserve semantic headings, alternative text, keyboard behavior, and current metadata when editing pages.

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

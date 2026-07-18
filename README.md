# TritonAI static website

This repository is a static, agent-maintainable migration of the public website at [tritonai.ucsd.edu](https://tritonai.ucsd.edu/). It preserves the current URL structure, visual presentation, and browser-side integrations while removing Cascade Server from the publishing workflow.

## Architecture

- `src/site/` contains the complete public site snapshot at its original paths.
- `content/newsletters/` contains the weekly-update source as Markdown. The newest entry is rendered on the homepage; all entries are rendered on `/about/ai-updates.html`.
- UC San Diego Decorator styles and scripts continue to load from `cdn.ucsd.edu`, so supported upstream Decorator changes flow through without being vendored here.
- TritonAI-owned images and small site-specific assets are stored locally so the site can eventually move away from the current domain.
- External services—including emergency messaging, UCSD search, Today@UCSD news, Google Analytics, and the TritonGPT widget—remain linked to their existing hosted implementations.
- `scripts/build.mjs` produces a deployable `dist/` directory and can apply a project-site base path for GitHub Pages without changing canonical source routes.

## Local development

```bash
npm install
npm test
python3 -m http.server 4173 -d dist
```

Open `http://127.0.0.1:4173/`.

To reproduce the GitHub Pages path locally:

```bash
SITE_BASE_PATH=/tritonai-website npm run build
SITE_BASE_PATH=/tritonai-website npm run validate
```

## Publishing a weekly update

1. Add a file named `content/newsletters/ucsd-ai-newsletter-YYYY-MM-DD.md`.
2. Include this frontmatter:

   ```yaml
   ---
   title: "Monday, July 13"
   date: 2026-07-13
   source: "ucsd-ai-newsletter-2026-07-13.md"
   items: 3
   ---
   ```

3. Write the newsletter body in Markdown.
4. Run `npm test` and open the homepage plus `/about/ai-updates.html` locally.
5. Submit the change through a pull request. A merge to `main` deploys GitHub Pages automatically.

Newsletter files are sorted by `date`, so agents do not need to edit the homepage HTML or archive page directly.

## Refreshing the public snapshot

`npm run crawl` performs a same-domain crawl starting from the homepage, sitemap, and all discovered internal links. It replaces `src/site/`, so use it only for an intentional full refresh. Afterward, run `npm run extract:newsletters` only if the production-rendered newsletters should replace the repository's Markdown sources.

The original crawl found two already-broken production destinations. They remain warnings in `reports/validation.json`; the build does not invent replacement content.

## Hosting portability

Source links retain the original route structure. GitHub Pages supplies `SITE_BASE_PATH=/tritonai-website` during its build. A future root-domain host should build with an empty `SITE_BASE_PATH`, which restores routes such as `/about/roadmap.html` without repository-name prefixes.

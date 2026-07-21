# TritonAI CMS UX review agent

The UX review agent compares TritonAI pages with current official UC San Diego Decorator 5 and department CMS examples. It is a review and draft-PR system, not an autonomous publisher.

## Sources and precedence

1. Current `developer.ucsd.edu` Decorator 5 documentation controls shared page chrome, layout, navigation, and interaction behavior.
2. `department.ucsd.edu` module examples control content-module choices such as tiles, CTAs, drawers, news, callouts, and profiles.
3. Blink authoring guidance and UCSD accessibility guidance control semantics, content structure, and review requirements.
4. TritonAI’s existing public routes and integrations remain authoritative and cannot be changed by a recipe.

Decorator archive pages are intentionally excluded.

## Runs and outputs

The workflow runs at 16:17 UTC on Monday and can be started manually from Actions. Manual inputs are:

- `audit-only`: creates the report and artifact only.
- `audit-and-draft`: additionally updates the tracking issue and may create up to two draft PRs.
- `route`: optionally limits browser checks to one generated route.

The workflow artifact retains the report and screenshots for 30 days. Local runs write the same generated data under `reports/ux-agent/`, which is ignored by Git.

```bash
npm run ux:audit -- --skip-browser
npm run ux:review -- --route /tools/index.html
```

Run `npm run build` first. Browser audits require `npx playwright install chromium` locally.

## Safe automatic changes

The agent can only create a draft PR when all of these conditions hold:

- The source block has matching `AGENT_SECTION` markers and is listed in `config/ux-agent.json`.
- The model selects an allowlisted component recipe.
- The recipe is explicitly marked `automatic` in configuration.
- The official reference page and its required selectors are available.
- Model confidence is at least 0.92.
- The recipe preserves visible text, link destinations and order, image source and alternative text, IDs, and integrations.
- Build, validation, accessibility, responsive, and keyboard checks pass.

The initial configuration intentionally marks every recipe as `automatic: false`. The first deployment therefore audits safely and reports recommendations; enabling any recipe is a separate reviewed configuration change after its rendered output has been approved.

The agent never writes custom CSS or JavaScript, changes routes or navigation, creates claims or metrics, adds images, or merges PRs. Pages without markers are report-only.

## Required review before merge

Draft visual PRs require content-owner review. Reviewers must complete responsive, keyboard, VoiceOver, and 200% zoom spot checks. Automated axe results support review but do not certify accessibility compliance.

# Presentation synchronization

`dist/_data/public-content.json` is the generated public-content contract for the TritonAI presentation and other approved consumers. It contains only public facts, roadmap entries, and use-case metadata.

## Recommended deck workflow

1. Build the website in root-host mode with `npm run build`.
2. Read `dist/_data/public-content.json` from the deck's data-loading or update process.
3. Match content by fact `id`, use-case `slug`, or roadmap period/title instead of copying prose by hand.
4. Keep deck-only internal material in the deck's audience controls. Never write it back into this repository's public-content files automatically.
5. If a public claim changes in the deck first, update and validate the website source before republishing the claim in either surface.

The export intentionally excludes rendered Markdown bodies and newsletter content. It is a claim and status synchronization layer, not a complete website feed.

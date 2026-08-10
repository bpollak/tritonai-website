# Skills Library synchronization

The public page at `/skills/index.html` is generated from the public [`dbalders/UCSD-Skills-Library`](https://github.com/dbalders/UCSD-Skills-Library) repository. It includes every `SKILL.md` immediately below the repository's `tritonai/` and `community/` collections and does not read from restricted skill repositories.

## Update flow

1. `npm run sync:skills` resolves the source repository's current default-branch commit.
2. The script validates the required skill frontmatter, inventories supporting files, and writes `content/skills/library.json`.
3. The site build renders the catalog with links pinned to that exact source commit.
4. The GitHub Pages workflow refreshes the catalog for review builds according to its configured preview triggers.
5. The manual Cascade workflow runs the sync before an approved Production or Stage release.
6. The release gate compares the refreshed source commit with the commit shown on the live catalog and stops before upload when production already has that version.

Normal source-repository changes remain in source control and the review site until an authorized maintainer starts the Cascade workflow manually.

If synchronization or validation fails, the workflow stops before deployment and the last successful site remains live. If production already carries the current source commit, the manual release stops before the build and Cascade upload. The committed JSON snapshot also permits deterministic local builds without making GitHub API requests.

## Source contract

- TritonAI-maintained skills must provide `name` and `description` in `SKILL.md` frontmatter.
- Community-maintained skills must also provide `maintainer`.
- Each public skill must live at `tritonai/<skill>/SKILL.md` or `community/<skill>/SKILL.md`.
- Supporting content may live under the skill directory in `references/`, `scripts/`, `assets/`, or other files.

The site validator rejects missing metadata, duplicate names or paths, unknown collections, an empty catalog, a source other than the approved public repository, or a snapshot older than 14 days. It warns when a snapshot is more than 48 hours old.

# Skills Library synchronization

The public page at `/skills/index.html` is generated from a public Skills Library repository. It includes every `SKILL.md` immediately below the repository's `tritonai/` and `community/` collections and does not read from restricted skill repositories.

## Which repository

`config/skills-source.json` is the single source of truth. `scripts/sync-skills.mjs` pulls from it, `scripts/validate.mjs` asserts the synced snapshot came from it, and `scripts/skills-release-gate.mjs` looks for its commit link on the live page.

```json
{ "owner": "dbalders", "repository": "UCSD-Skills-Library" }
```

`SKILLS_REPOSITORY_OWNER` and `SKILLS_REPOSITORY_NAME` override it at runtime, which is how you test against a fork without committing a config change.

### Migrating to a different repository

The library is moving to an official UC San Diego repository. When it lands:

1. Edit `owner` and `repository` in `config/skills-source.json`.
2. Run `npm run sync:skills` — `content/skills/library.json` is rewritten, and every `sourceUrl` and `directoryUrl` in it re-points at the new repository and commit.
3. Run `npm test`. Skipping step 2 fails validation with a message naming both repositories, rather than silently publishing a stale catalog.
4. Point the Skills Library's `skills-library-updated` repository dispatch at this repo from the new location, so the production refresh still triggers.

The first production release after a migration will not short-circuit: the release gate looks for the configured repository's commit link on the live page, does not find it, and refreshes. That is intended.

## Update flow

1. `npm run sync:skills` resolves the source repository's current default-branch commit.
2. The script validates the required skill frontmatter, inventories supporting files, and writes `content/skills/library.json`.
3. The site build renders the catalog with links pinned to that exact source commit.
4. The GitHub Pages workflow runs the sync for pull requests, main pushes, its hourly staging schedule, repository events, and manual runs.
5. The Cascade workflow runs the sync before main-branch and manual production releases. It also checks production once per day and when the Skills Library sends a `skills-library-updated` repository event.
6. Daily and repository-triggered production runs compare the refreshed source commit with the commit shown on the live catalog. They build, validate, upload, and publish through Cascade only when production needs the update.

The daily production check runs at 13:27 UTC. Normal source-repository changes enter the standard Cascade publishing path on the next check and do not require a site commit. For an immediate refresh, dispatch a `skills-library-updated` repository event to `bpollak/tritonai-website` or start the Cascade workflow manually.

If synchronization or validation fails, the workflow stops before deployment and the last successful site remains live. If production already carries the current source commit, the daily job stops before the build and Cascade upload. The committed JSON snapshot also permits deterministic local builds without making GitHub API requests.

## Source contract

- TritonAI-maintained skills must provide `name` and `description` in `SKILL.md` frontmatter.
- Community-maintained skills must also provide `maintainer`.
- Each public skill must live at `tritonai/<skill>/SKILL.md` or `community/<skill>/SKILL.md`.
- Supporting content may live under the skill directory in `references/`, `scripts/`, `assets/`, or other files.

The site validator rejects missing metadata, duplicate names or paths, unknown collections, an empty catalog, a source other than the approved public repository, or a snapshot older than 14 days. It warns when a snapshot is more than 48 hours old.

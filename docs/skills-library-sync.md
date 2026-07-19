# Skills Library synchronization

The public page at `/skills/index.html` is generated from the public [`dbalders/UCSD-Skills-Library`](https://github.com/dbalders/UCSD-Skills-Library) repository. It includes every `SKILL.md` immediately below the repository's `tritonai/` and `community/` collections and does not read from restricted skill repositories.

## Update flow

1. `npm run sync:skills` resolves the source repository's current default-branch commit.
2. The script validates the required skill frontmatter, inventories supporting files, and writes `content/skills/library.json`.
3. The site build renders the catalog with links pinned to that exact source commit.
4. GitHub Actions runs the sync before pull-request and deployment builds, and once per hour on the default branch.

The hourly workflow means normal source-repository changes appear without a corresponding site commit. For an immediate refresh, dispatch a `skills-library-updated` repository event to `bpollak/tritonai-website`; the next workflow run will synchronize and deploy the new catalog.

If synchronization or validation fails, the workflow stops before deployment and the last successful site remains live. The committed JSON snapshot also permits deterministic local builds without making GitHub API requests.

## Source contract

- TritonAI-maintained skills must provide `name` and `description` in `SKILL.md` frontmatter.
- Community-maintained skills must also provide `maintainer`.
- Each public skill must live at `tritonai/<skill>/SKILL.md` or `community/<skill>/SKILL.md`.
- Supporting content may live under the skill directory in `references/`, `scripts/`, `assets/`, or other files.

The site validator rejects missing metadata, duplicate names or paths, unknown collections, an empty catalog, a source other than the approved public repository, or a snapshot older than 14 days. It warns when a snapshot is more than 48 hours old.

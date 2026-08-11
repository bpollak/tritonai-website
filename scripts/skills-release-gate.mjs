import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadSkillsSource } from "./lib/skills-source.mjs";

const AUTOMATED_SKILLS_EVENTS = new Set(["schedule", "repository_dispatch"]);
const COMMIT_PATTERN = /^[0-9a-f]{40}$/i;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function snapshotCommit(snapshot) {
  const commit = String(snapshot?.source?.commitSha || "").toLowerCase();
  if (!COMMIT_PATTERN.test(commit)) throw new Error("Skills snapshot does not contain a valid source commit SHA.");
  return commit;
}

export function liveCommitFromHtml(html, repository) {
  // The repository always arrives from the synced snapshot, which records where
  // it actually came from. Only the unit tests call this without one.
  const repositoryPattern = escapeRegExp(String(repository || ""));
  if (!repositoryPattern) return "";
  const match = String(html).match(new RegExp(`${repositoryPattern}/commit/([0-9a-f]{40})`, "i"));
  return match?.[1]?.toLowerCase() || "";
}

export function shouldDeploySkills(eventName, localCommit, liveCommit) {
  if (!AUTOMATED_SKILLS_EVENTS.has(eventName)) return true;
  return !liveCommit || localCommit !== liveCommit;
}

async function fetchLiveCommit(url, repository) {
  const response = await fetch(url, {
    headers: { "User-Agent": "tritonai-website-skills-release-gate" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Production Skills Library returned HTTP ${response.status}.`);
  return liveCommitFromHtml(await response.text(), repository);
}

async function main() {
  const snapshotPath = process.env.SKILLS_SNAPSHOT_PATH || "content/skills/library.json";
  const liveUrl = (await loadSkillsSource()).liveUrl;
  const eventName = process.env.GITHUB_EVENT_NAME || "workflow_dispatch";
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  const localCommit = snapshotCommit(snapshot);
  let liveCommit = "";

  if (AUTOMATED_SKILLS_EVENTS.has(eventName)) {
    try {
      liveCommit = await fetchLiveCommit(liveUrl, snapshot.source.repository);
      if (!liveCommit) console.log("::warning::The live Skills Library did not expose a pinned source commit; production will be refreshed.");
    } catch (error) {
      console.log(`::warning::${error.message} Production will be refreshed so the release can self-heal.`);
    }
  }

  const shouldDeploy = shouldDeploySkills(eventName, localCommit, liveCommit);
  if (shouldDeploy) {
    console.log(`Production update required for Skills Library commit ${localCommit}.`);
  } else {
    console.log(`Production already carries Skills Library commit ${localCommit}; skipping Cascade.`);
  }

  const output = [
    `should_deploy=${shouldDeploy}`,
    `skills_commit=${localCommit}`,
    `live_commit=${liveCommit}`,
  ].join("\n");
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${output}\n`);
  else process.stdout.write(`${output}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

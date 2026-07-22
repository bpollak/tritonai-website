import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, loadConfig } from "./lib.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options }).trim();
}

function issueBody(report) {
  return [
    "<!-- tritonai-ux-agent-tracking -->",
    "# TritonAI CMS UX review",
    "",
    `Latest run: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Reference failures: ${report.references.filter((reference) => !reference.ok).length}`,
    `Eligible draft proposals: ${report.draftCandidates.length}`,
    "",
    "The complete JSON report and screenshots are attached to the GitHub Actions run artifact.",
    "",
    "## Findings",
    "",
    ...report.findings.map((finding) => `- ${finding.sectionId}: ${finding.disposition}; ${finding.currentPattern} → ${finding.recommendedComponent}; confidence ${finding.confidence.toFixed(2)}.`),
  ].join("\n");
}

function prBody(proposal, report) {
  return [
    "## UX-agent proposal",
    "",
    `- Finding fingerprint: \`${proposal.fingerprint}\``,
    `- Route: \`${proposal.route}\``,
    `- Section: \`${proposal.sectionId}\``,
    `- Recipe: \`${proposal.recipe.id}\``,
    `- Confidence: ${proposal.confidence.toFixed(2)}`,
    `- Ownership: ${proposal.ownership}`,
    "",
    "This PR was generated from an allowlisted section and deterministic recipe. It preserves visible copy, links, images, IDs, and integrations; it does not include generated CSS or JavaScript.",
    "",
    "## Required review",
    "",
    "- [ ] Content-owner review",
    "- [ ] Responsive and keyboard check",
    "- [ ] VoiceOver and 200% zoom spot check",
    "- [ ] Review the UX-agent artifact attached to the workflow run",
    "",
    `Reference checks: ${report.references.filter((reference) => reference.ok).map((reference) => reference.id).join(", ")}.`,
  ].join("\n");
}

const reportFile = option("--report");
if (!reportFile) throw new Error("Use --report <reports/ux-agent/run/report.json>");
const config = await loadConfig();
const report = JSON.parse(await readFile(path.resolve(reportFile), "utf8"));
if (report.constraints?.failClosed) {
  process.stdout.write("UX agent is fail-closed; publishing the report without draft pull requests.\n");
}
if (run("git", ["status", "--porcelain"])) throw new Error("The publishing checkout must be clean before creating UX proposal branches.");
run("gh", ["label", "create", "ux-agent", "--color", "00629b", "--description", "Automated CMS UX review", "--force"]);
run("gh", ["label", "create", "content-owner-review", "--color", "ffcd00", "--description", "Content-owner review required", "--force"]);
const issueCandidates = JSON.parse(run("gh", ["issue", "list", "--state", "open", "--search", `${config.trackingIssueTitle} in:title`, "--json", "number,title"]));
const reportDir = path.dirname(path.resolve(reportFile));
const bodyFile = path.join(reportDir, "tracking-issue.md");
await writeFile(bodyFile, issueBody(report));
let issueNumber;
if (issueCandidates.length) {
  issueNumber = issueCandidates[0].number;
  run("gh", ["issue", "edit", String(issueNumber), "--title", config.trackingIssueTitle, "--body-file", bodyFile, "--add-label", "ux-agent"]);
} else {
  const created = run("gh", ["issue", "create", "--title", config.trackingIssueTitle, "--body-file", bodyFile, "--label", "ux-agent"]);
  issueNumber = Number(created.split("/").pop());
}

const results = [];
const candidates = report.constraints?.failClosed ? [] : (report.draftCandidates || []).slice(0, config.maxDraftPullRequests);
for (const proposal of candidates) {
  const existing = JSON.parse(run("gh", ["pr", "list", "--state", "open", "--search", proposal.fingerprint, "--json", "number,body"]));
  if (existing.some((pullRequest) => pullRequest.body.includes(proposal.fingerprint))) {
    results.push({ sectionId: proposal.sectionId, status: "skipped", reason: "Equivalent pull request is already open" });
    continue;
  }
  const slug = proposal.sectionId.replace(/^ux-/, "");
  const date = new Date().toISOString().slice(0, 10);
  const branch = `content/update-ux-${slug}-${date}`;
  const proposalFile = path.join(reportDir, `proposal-${slug}.json`);
  const proposalBodyFile = path.join(reportDir, `pr-${slug}.md`);
  const worktreeDir = path.join(reportDir, `worktree-${slug}`);
  await writeFile(proposalFile, `${JSON.stringify(proposal, null, 2)}\n`);
  await writeFile(proposalBodyFile, prBody(proposal, report));
  try {
    run("git", ["worktree", "add", "-b", branch, worktreeDir, "origin/main"]);
    run("node", ["scripts/ux-agent/apply.mjs", "--proposal", proposalFile], { cwd: worktreeDir });
    run("node", ["scripts/ux-agent/verify.mjs", "--source", proposal.sourceFile, "--section", proposal.sectionId], { cwd: worktreeDir });
    run("npm", ["test"], { cwd: worktreeDir });
    run("npm", ["run", "build"], { cwd: worktreeDir, env: { ...process.env, SITE_BASE_PATH: "/tritonai-website" } });
    run("npm", ["run", "validate"], { cwd: worktreeDir, env: { ...process.env, SITE_BASE_PATH: "/tritonai-website" } });
    const candidateRunId = `candidate-${slug}`;
    run("node", ["scripts/ux-agent/run.mjs", "--mode", "audit-only", "--route", proposal.route], { cwd: worktreeDir, env: { ...process.env, UX_AGENT_RUN_ID: candidateRunId } });
    run("node", ["scripts/ux-agent/candidate-check.mjs", "--baseline", path.resolve(reportFile), "--candidate", path.join(worktreeDir, "reports", "ux-agent", candidateRunId, "report.json"), "--route", proposal.route], { cwd: worktreeDir });
    run("git", ["add", "--", proposal.sourceFile], { cwd: worktreeDir });
    run("git", ["commit", "-m", `UX: apply ${proposal.recipe.id} to ${proposal.sectionId}`], { cwd: worktreeDir });
    run("git", ["push", "--set-upstream", "origin", branch], { cwd: worktreeDir });
    const url = run("gh", ["pr", "create", "--draft", "--base", "main", "--head", branch, "--title", `UX: apply ${proposal.recipe.id} to ${proposal.sectionId}`, "--body-file", proposalBodyFile]);
    run("gh", ["pr", "edit", url, "--add-reviewer", config.defaultReviewer, "--add-label", "ux-agent", "--add-label", "content-owner-review"]);
    results.push({ sectionId: proposal.sectionId, status: "created", url });
  } catch (error) {
    results.push({ sectionId: proposal.sectionId, status: "failed", reason: error.stderr || error.message });
  } finally {
    try {
      run("git", ["worktree", "remove", "--force", worktreeDir]);
    } catch {}
  }
}
run("gh", ["issue", "comment", String(issueNumber), "--body", `Run ${report.runId} completed. Draft proposal results: ${results.length ? results.map((result) => `${result.sectionId} ${result.status}`).join(", ") : "none"}.`]);
process.stdout.write(`${JSON.stringify({ issueNumber, results }, null, 2)}\n`);

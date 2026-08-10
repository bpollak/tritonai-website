import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL(
  "../.github/workflows/cascade-upload.yml",
  import.meta.url,
);

test("Cascade releases can only be started manually", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(workflow, /^\s{2}workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^\s{2}push:/m);
  assert.doesNotMatch(workflow, /^\s{2}(pull_request|schedule|repository_dispatch):/m);
});

test("production requires an explicit confirmation from main", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(workflow, /confirm_production:/);
  assert.match(workflow, /Production publishing requires confirm_production=true/);
  assert.match(workflow, /main:refs\/heads\/main/);
  assert.match(workflow, /preview:refs\/heads\/preview/);
});

test("Cascade upload is skipped when the release gate finds no update", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(
    workflow,
    /deploy:\n(?:.|\n)*?if: needs\.build\.outputs\.should_deploy == 'true'/,
  );
});

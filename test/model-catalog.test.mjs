import assert from "node:assert/strict";
import test from "node:test";

import {
  modelPublisher,
  sortModelsByPublisherAndRecency,
} from "../scripts/lib/model-catalog.mjs";

test("identifies publishers from public model ids", () => {
  assert.equal(modelPublisher("claude-opus-5"), "Anthropic");
  assert.equal(modelPublisher("gemini-3.6-flash"), "Google");
  assert.equal(modelPublisher("api-gemma-4-31b"), "Google");
  assert.equal(modelPublisher("api-gpt-oss-120b"), "OpenAI");
  assert.equal(modelPublisher("moonshotai.kimi-k2.5"), "Moonshot AI");
});

test("groups models by publisher and shows recent launches first", () => {
  const ids = [
    "gpt-5.4",
    "claude-opus-4-6",
    "moonshotai.kimi-k2.5",
    "gemini-3.5-flash",
    "claude-sonnet-5",
    "api-gpt-oss-120b",
    "kimi-k2.6",
    "gpt-5.6-terra",
    "api-gemma-4-31b",
    "claude-opus-5",
    "gemini-3.6-flash",
  ];

  const sorted = sortModelsByPublisherAndRecency(ids.map((id) => ({ id })));

  assert.deepEqual(
    sorted.map(({ id }) => id),
    [
      "claude-opus-5",
      "claude-sonnet-5",
      "claude-opus-4-6",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "api-gemma-4-31b",
      "gpt-5.6-terra",
      "gpt-5.4",
      "api-gpt-oss-120b",
      "kimi-k2.6",
      "moonshotai.kimi-k2.5",
    ],
  );
});

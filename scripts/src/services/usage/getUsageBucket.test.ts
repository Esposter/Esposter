import { UsageBucket } from "#src/models/usage/UsageBucket";
import { getUsageBucket } from "#src/services/usage/getUsageBucket";
import { describe, expect, test } from "vitest";

describe(getUsageBucket, () => {
  test.each([
    ["/projects/app/workflows/run.jsonl", UsageBucket.Workflow],
    ["/projects/app/subagents/agent.jsonl", UsageBucket.Subagent],
    ["/projects/app/session.jsonl", UsageBucket.Main],
  ])("%s is bucketed as %s", (path, bucket) => {
    expect.hasAssertions();

    expect(getUsageBucket(path)).toBe(bucket);
  });
});

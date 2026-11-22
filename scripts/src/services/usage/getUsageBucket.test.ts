import { UsageBucket } from "#src/models/usage/UsageBucket";
import { SUBAGENT_FOLDER, WORKFLOW_FOLDER } from "#src/services/usage/constants";
import { getUsageBucket } from "#src/services/usage/getUsageBucket";
import { describe, expect, test } from "vitest";

describe(getUsageBucket, () => {
  test.each([
    [`/projects/app/${WORKFLOW_FOLDER}/run.jsonl`, UsageBucket.Workflow],
    [`/projects/app/${SUBAGENT_FOLDER}/agent.jsonl`, UsageBucket.Subagent],
    [`C:\\projects\\app\\${SUBAGENT_FOLDER}\\agent.jsonl`, UsageBucket.Subagent],
    ["/projects/app/session.jsonl", UsageBucket.Main],
  ])("%s is bucketed as %s", (path, bucket) => {
    expect.hasAssertions();

    expect(getUsageBucket(path)).toBe(bucket);
  });
});

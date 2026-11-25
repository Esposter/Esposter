import { getTickedTaskMissingTests } from "#src/services/openspec/getTickedTaskMissingTests";
import { readOpenChanges } from "#src/services/openspec/readOpenChanges";
import { readTestTitleKeys } from "#src/services/openspec/readTestTitleKeys";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

// A ticked task says its work is done, and its Verify clause quotes the scenarios its tests hold. Nothing else fails
// When a test is renamed or never written: the task stays ticked and its quote reads as a pointer to a test that is not
// There. Every open change holds to it (the `openspec` skill, Process rule 4)
describe("openspecTickedTasks", () => {
  test(
    "every scenario a ticked task's Verify clause quotes has a test of that title",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const testTitleKeys = readTestTitleKeys();
      const missing = readOpenChanges().flatMap(({ id, scenarioTitles, tasksText }) =>
        getTickedTaskMissingTests(tasksText, scenarioTitles, testTitleKeys).map((claim) => `${id} ${claim}`),
      );

      expect(missing).toStrictEqual([]);
    },
  );
});

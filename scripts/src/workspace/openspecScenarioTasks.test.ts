import { getScenarioTaskMismatches } from "#src/services/openspec/getScenarioTaskMismatches";
import { readOpenChanges } from "#src/services/openspec/readOpenChanges";
import { describe, expect, test } from "vitest";

// A change's tasks name the scenarios its spec delta holds, and each scenario is named by a task (the `openspec` skill,
// Process rule 4). Every open change holds to it
describe("openspecScenarioTasks", () => {
  test("every open change's tasks and delta name the same scenarios", () => {
    expect.hasAssertions();

    const mismatches = readOpenChanges()
      .map(({ id, scenarioTitles, tasksText }) => ({
        id,
        mismatches: getScenarioTaskMismatches(tasksText, scenarioTitles),
      }))
      .filter(
        ({ mismatches: { unheldByDelta, unnamedByTasks } }) => unheldByDelta.length > 0 || unnamedByTasks.length > 0,
      )
      .map(
        ({ id, mismatches: { unheldByDelta, unnamedByTasks } }) =>
          `${id}: unheld by its delta ${JSON.stringify(unheldByDelta)}, unnamed by its tasks ${JSON.stringify(unnamedByTasks)}`,
      );

    expect(mismatches).toStrictEqual([]);
  });
});

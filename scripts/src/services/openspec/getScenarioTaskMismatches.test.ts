import { getScenarioTaskMismatches } from "#src/services/openspec/getScenarioTaskMismatches";
import { describe, expect, test } from "vitest";

describe(getScenarioTaskMismatches, () => {
  test("reports a title a task names after 'scenario' that the delta lacks, and the scenario it holds unnamed", () => {
    expect.hasAssertions();

    const tasksText =
      "- [ ] 1.1 Fit the rig. Verify: a test named after the scenario 'A rig keeps its pose', written first.";

    expect(getScenarioTaskMismatches(tasksText, ["A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: ["A rig keeps its pose"],
      unnamedByTasks: ["A rig keeps its weight"],
    });
  });

  test("reports a scenario of the delta that no task quotes", () => {
    expect.hasAssertions();

    const tasksText = "- [ ] 1.1 Fit the rig. Verify: the rig's test, written first and seen failing.";

    expect(getScenarioTaskMismatches(tasksText, ["A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: [],
      unnamedByTasks: ["A rig keeps its weight"],
    });
  });

  test("reports nothing for a change whose tasks quote every scenario its delta holds", () => {
    expect.hasAssertions();

    const tasksText = [
      "- [ ] 1.1 Fit the rig. Verify: tests named after the scenarios 'A rig keeps its pose' and",
      '  "A rig keeps its weight", written first.',
      "- [ ] 1.2 Read the rig. Verify: a test asserting 'a quote no scenario word precedes', written first.",
    ].join("\n");

    expect(getScenarioTaskMismatches(tasksText, ["A rig keeps its pose", "A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: [],
      unnamedByTasks: [],
    });
  });

  test("reads a title with an apostrophe before a space whole, so it is not cut at that apostrophe", () => {
    expect.hasAssertions();

    const title = "The rig's joints' pose holds";
    const tasksText = `- [ ] 1.1 Fit the rig. Verify: a test named after the scenario '${title}', written first.`;

    expect(getScenarioTaskMismatches(tasksText, [title])).toStrictEqual({ unheldByDelta: [], unnamedByTasks: [] });
  });
});

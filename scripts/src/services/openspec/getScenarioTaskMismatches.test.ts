import { getScenarioTaskMismatches } from "#src/services/openspec/getScenarioTaskMismatches";
import { describe, expect, test } from "vitest";

describe(getScenarioTaskMismatches, () => {
  test("reports a title a task names after 'scenario' that the delta lacks, and the scenario it holds unnamed", () => {
    expect.hasAssertions();

    const tasksText = "scenario 'A rig keeps its pose'";

    expect(getScenarioTaskMismatches(tasksText, ["A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: ["A rig keeps its pose"],
      unnamedByTasks: ["A rig keeps its weight"],
    });
  });

  test("reports a scenario of the delta that no task quotes", () => {
    expect.hasAssertions();

    expect(getScenarioTaskMismatches("", ["A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: [],
      unnamedByTasks: ["A rig keeps its weight"],
    });
  });

  test("reports nothing for a change whose tasks quote every scenario its delta holds", () => {
    expect.hasAssertions();

    const tasksText = [
      "scenarios 'A rig keeps its pose' and",
      '"A rig keeps its weight"',
      "'a quote no scenario word precedes'",
    ].join("\n");

    expect(getScenarioTaskMismatches(tasksText, ["A rig keeps its pose", "A rig keeps its weight"])).toStrictEqual({
      unheldByDelta: [],
      unnamedByTasks: [],
    });
  });

  test("reads a title with an apostrophe before a space whole, so it is not cut at that apostrophe", () => {
    expect.hasAssertions();

    const title = "The rig's joints' pose holds";
    const tasksText = `scenario '${title}'`;

    expect(getScenarioTaskMismatches(tasksText, [title])).toStrictEqual({ unheldByDelta: [], unnamedByTasks: [] });
  });

  test("reads a longer quote whole past a held title that ends at an apostrophe inside it, and names no held title by it", () => {
    expect.hasAssertions();

    const tasksText = "scenario 'A rig's pose'";

    expect(getScenarioTaskMismatches(tasksText, ["A rig"])).toStrictEqual({
      unheldByDelta: ["A rig's pose"],
      unnamedByTasks: ["A rig"],
    });
  });
});

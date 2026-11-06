import { getTickedTaskMissingTests } from "#src/services/openspec/getTickedTaskMissingTests";
import { describe, expect, test } from "vitest";

describe(getTickedTaskMissingTests, () => {
  const SCENARIO_TITLES = ["A rig keeps its pose", "A rig keeps its weight"];

  test("reports a scenario a ticked task's Verify clause quotes that no test is titled for", () => {
    expect.hasAssertions();

    const tasksText = "- [x] 1.1 Keep the pose. Verify: tests named after the scenarios 'A rig keeps its pose'.";

    expect(getTickedTaskMissingTests(tasksText, SCENARIO_TITLES, new Set())).toStrictEqual([
      '1.1 "A rig keeps its pose"',
    ]);
  });

  test("reports every scenario of a list and the task each is quoted in", () => {
    expect.hasAssertions();

    const tasksText = [
      "- [x] 1.1 Keep the pose. Verify: the scenario 'A rig keeps its pose'.",
      "- [x] 1.2 Keep the weight. Verify: the scenarios 'A rig keeps its pose' and",
      "  'A rig keeps its weight' hold.",
    ].join("\n");

    expect(getTickedTaskMissingTests(tasksText, SCENARIO_TITLES, new Set())).toStrictEqual([
      '1.1 "A rig keeps its pose"',
      '1.2 "A rig keeps its pose"',
      '1.2 "A rig keeps its weight"',
    ]);
  });

  test.each([
    ["a task that is still open", "- [ ] 1.1 Keep the pose. Verify: the scenario 'A rig keeps its pose'."],
    ["a ticked task with no Verify clause", "- [x] 1.1 Keep the pose, the scenario 'A rig keeps its pose'."],
    ["a quote no scenario word precedes", "- [x] 1.1 Keep the pose. Verify: typecheck holds 'A rig keeps its pose'."],
    [
      "a title in the task's text before its Verify clause",
      "- [x] 1.1 Keep the scenario 'A rig keeps its pose'. Verify: typecheck passes.",
    ],
    [
      "a quote in the next task",
      "- [x] 1.1 Keep the pose. Verify: typecheck passes.\n- [ ] 1.2 Keep it. Verify: the scenario 'A rig keeps its pose'.",
    ],
  ])("leaves %s alone", (_label, tasksText) => {
    expect.hasAssertions();

    expect(getTickedTaskMissingTests(tasksText, SCENARIO_TITLES, new Set())).toStrictEqual([]);
  });

  test("holds a scenario by a test whose title differs in case and punctuation", () => {
    expect.hasAssertions();

    const tasksText = "- [x] 1.1 Keep the pose. Verify: the scenario 'A rig keeps its pose'.";

    expect(getTickedTaskMissingTests(tasksText, SCENARIO_TITLES, new Set(["arigkeepsitspose"]))).toStrictEqual([]);
  });
});

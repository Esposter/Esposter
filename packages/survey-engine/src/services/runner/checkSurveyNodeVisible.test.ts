import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNodeVisible } from "#src/services/runner/checkSurveyNodeVisible";
import { surveyNodeSchema } from "#src/services/surveyNodeSchema";
import { describe, expect, test } from "vitest";

describe(checkSurveyNodeVisible, () => {
  const now = new Date(0);

  test.each([
    ["a node with no condition is visible", "", {}, true],
    ["a node whose condition holds is visible", "{a} = 'a'", { a: "a" }, true],
    ["a node whose condition does not hold is hidden", "{a} = 'a'", { a: "b" }, false],
    ["a node whose condition faults is hidden", "({a}", { a: "a" }, false],
  ])("%s", (_name, visibleIf, values, expected) => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { id: "a", name: "a", visibleIf }, type: SurveyNodeType.Text });

    expect(checkSurveyNodeVisible(node, values, now)).toBe(expected);
  });
});

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNodeRequired } from "#src/services/runner/checkSurveyNodeRequired";
import { surveyNodeSchema } from "#src/services/surveyNodeSchema";
import { describe, expect, test } from "vitest";

// The condition's own matrix, faults included, lives in checkSurveyExpressionHolds.test.ts, so here only the node's requiredIf is read
describe(checkSurveyNodeRequired, () => {
  const now = new Date(0);

  test.each([
    ["a question flagged required is required", { isRequired: true }, {}, true],
    ["a question whose requirement condition holds is required", { requiredIf: "{a} = 'a'" }, { a: "a" }, true],
    [
      "a question whose requirement condition does not hold is not required",
      { requiredIf: "{a} = 'a'" },
      { a: "b" },
      false,
    ],
    ["a question with no requirement is not required", {}, {}, false],
  ])("%s", (_name, props, values, expected) => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { id: "a", name: "a", ...props }, type: SurveyNodeType.Text });

    expect(checkSurveyNodeRequired(node, values, now)).toBe(expected);
  });

  test("a block of markup holds no requirement", () => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { id: "a", name: "a" }, type: SurveyNodeType.Html });

    expect(checkSurveyNodeRequired(node, {}, now)).toBe(false);
  });
});

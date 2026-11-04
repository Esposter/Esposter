import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNodeEnabled } from "#src/services/runner/checkSurveyNodeEnabled";
import { surveyNodeSchema } from "#src/services/surveyNodeSchema";
import { describe, expect, test } from "vitest";

// The condition's own matrix, faults included, lives in checkSurveyExpressionHolds.test.ts, so here only the node's enableIf is read
describe(checkSurveyNodeEnabled, () => {
  const now = new Date(0);

  test.each([
    ["a node with no condition is enabled", "", {}, true],
    ["a node whose condition holds is enabled", "{a} = 'a'", { a: "a" }, true],
    ["a node whose condition does not hold is disabled", "{a} = 'a'", { a: "b" }, false],
  ])("%s", (_name, enableIf, values, expected) => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { enableIf, id: "a", name: "a" }, type: SurveyNodeType.Text });

    expect(checkSurveyNodeEnabled(node, values, now)).toBe(expected);
  });

  test.each([
    ["a calculated value", SurveyNodeType.Expression, { expression: "{a}", name: "a" }],
    ["a block of markup", SurveyNodeType.Html, { name: "a" }],
    ["a picture", SurveyNodeType.Image, { name: "a" }],
  ])("%s holds no answer, so it is never enabled", (_name, type, props) => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { id: "a", ...props }, type });

    expect(checkSurveyNodeEnabled(node, {}, now)).toBe(false);
  });

  test("a page has no enabling condition and is enabled", () => {
    expect.hasAssertions();

    const node = surveyNodeSchema.parse({ props: { children: [], id: "a" }, type: SurveyNodeType.Page });

    expect(checkSurveyNodeEnabled(node, {}, now)).toBe(true);
  });
});

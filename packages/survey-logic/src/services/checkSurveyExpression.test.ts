import { checkSurveyExpression } from "#src/services/checkSurveyExpression";
import { describe, expect, test } from "vitest";

describe(checkSurveyExpression, () => {
  test("an unclosed parenthesis", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("({age} > 5")).toStrictEqual({
      message: "Expected ) to close the parenthesis opened here",
      position: 10,
    });
  });

  test("an unknown function", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("nosuchfunction({age})")).toStrictEqual({
      message: 'Unknown function "nosuchfunction"',
      position: 0,
    });
  });

  test("an unknown function is named at its first call in source order", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("nosuchouter(nosuchinner())")).toStrictEqual({
      message: 'Unknown function "nosuchouter"',
      position: 0,
    });
  });

  test("a source that calls no function is not refused", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("{age} > 5")).toBeUndefined();
  });
});

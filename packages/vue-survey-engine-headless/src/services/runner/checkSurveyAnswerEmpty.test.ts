import { checkSurveyAnswerEmpty } from "#src/services/runner/checkSurveyAnswerEmpty";
import { describe, expect, test } from "vitest";

describe(checkSurveyAnswerEmpty, () => {
  test.each([
    [undefined, true],
    ["", true],
    [" ", true],
    [[], true],
    [false, false],
    [0, false],
    [["a"], false],
  ])("checkSurveyAnswerEmpty(%j) is %s", (value, expected) => {
    expect.hasAssertions();

    expect(checkSurveyAnswerEmpty(value)).toBe(expected);
  });
});

import { isSurveyAnswerEmpty } from "#src/services/runner/answer/isSurveyAnswerEmpty";
import { describe, expect, test } from "vitest";

describe(isSurveyAnswerEmpty, () => {
  test.each([
    [undefined, true],
    ["", true],
    [[], true],
    [false, false],
    [0, false],
    [["a"], false],
  ])("isSurveyAnswerEmpty(%j) is %s", (value, expected) => {
    expect.hasAssertions();

    expect(isSurveyAnswerEmpty(value)).toBe(expected);
  });
});

import { parseSurveyNumberBound } from "#src/services/runner/answer/parseSurveyNumberBound";
import { describe, expect, test } from "vitest";

describe(parseSurveyNumberBound, () => {
  test.each([
    ["", undefined],
    [" ", undefined],
    ["a", undefined],
    ["0.5", 0.5],
  ])("parseSurveyNumberBound(%j) is %s", (bound, expected) => {
    expect.hasAssertions();

    expect(parseSurveyNumberBound(bound)).toBe(expected);
  });
});

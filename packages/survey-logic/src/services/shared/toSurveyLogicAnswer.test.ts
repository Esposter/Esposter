import { toSurveyLogicAnswer } from "#src/services/shared/toSurveyLogicAnswer";
import { describe, expect, test } from "vitest";

describe(toSurveyLogicAnswer, () => {
  test.each([
    ["keeps a text with a leading zero as text", "007", "007"],
    ["keeps a spaced text with a leading zero as text, reading the trimmed text", " 007", " 007"],
    ["reads a text with a trailing space after a lone zero as that number", "0 ", 0],
    ["reads a text with a leading space before a number as that number", " 7", 7],
    ["keeps a zero followed by a point as the number it reads as", "0.5", 0.5],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(expected);
  });
});

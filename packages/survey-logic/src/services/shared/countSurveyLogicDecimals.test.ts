import { countSurveyLogicDecimals } from "#src/services/shared/countSurveyLogicDecimals";
import { describe, expect, test } from "vitest";

describe(countSurveyLogicDecimals, () => {
  test.each([
    ["a whole number has no decimals", 100, 0],
    ["a two-decimal number has two decimals", 2.25, 2],
    ["a negative two-decimal number has two decimals", -2.25, 2],
    ["a one-decimal number has one decimal", 0.1, 1],
    ["a small number in exponent form counts the digits after its point, exponent included", 1.5e-7, 8],
    ["a large number in exponent form has no decimals", 1e21, 0],
  ])("%s", (_title, number, expected) => {
    expect.hasAssertions();

    expect(countSurveyLogicDecimals(number)).toStrictEqual(expected);
  });
});

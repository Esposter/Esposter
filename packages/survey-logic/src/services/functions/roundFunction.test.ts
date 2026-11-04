import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { roundFunction } from "#src/services/functions/roundFunction";
import { describe, expect, test } from "vitest";

describe(roundFunction, () => {
  test.each([
    ["a number rounded to decimal places", [3.14951, 2], 3.15],
    ["a half rounds away from zero", [2.5], 3],
    ["a negative half rounds away from zero", [-2.5], -3],
    ["a negative precision rounds to tens", [1234.5678, -2], 1200],
    ["a numeric string is read as its number", ["2.71828", 2], 2.72],
    ["a decimal comma reads as no number, so the result is undefined", ["1,5", 1], undefined],
    ["a list reads as no number, so the result is undefined", [[3.14951], 2], undefined],
    ["a precision given as a numeric string is read as its number", [3.14951, "2"], 3.15],
    ["an empty first argument gives no result, even with a precision", [undefined, 2], undefined],
    ["a value that reads as no number gives no result", ["x", 2], undefined],
    ["a precision that reads as no number gives no result", [3.14951, "x"], undefined],
    ["no argument gives no result", [], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(roundFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

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
    ["a decimal comma reads as a point", ["1,5", 1], 1.5],
    ["an array's items are read in place of the array", [[3.14951], 2], 3.15],
    ["a precision given as a numeric string is read as its number", [3.14951, "2"], 3.15],
    ["an empty first argument is skipped, so the precision becomes the number", [undefined, 2], 2],
    ["a value that reads as no number is NaN", ["x", 2], Number.NaN],
    ["a precision that reads as no number is NaN", [3.14951, "x"], Number.NaN],
    ["no argument is NaN", [], Number.NaN],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(roundFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

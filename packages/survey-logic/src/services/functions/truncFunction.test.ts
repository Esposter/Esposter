import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { truncFunction } from "#src/services/functions/truncFunction";
import { describe, expect, test } from "vitest";

describe(truncFunction, () => {
  test.each([
    ["a number cut to its whole part", [3.789], 3],
    ["a number cut to decimal places", [3.789, 1], 3.7],
    ["a negative number cut toward zero", [-3.789, 1], -3.7],
    ["a number cut to two decimal places", [3.14951, 2], 3.14],
    ["a precision that is not a whole positive number keeps the whole part", [3.7, 1.5], 3],
    ["a zero precision keeps the whole part", [3.7, 0], 3],
    ["a decimal comma reads as a point", ["1,5", 1], 1.5],
    ["an empty first argument is skipped, so the precision becomes the number", [undefined, 2], 2],
    ["a number written in exponent form reads as NaN, as SurveyJS reads it", [0.0000001, 1], Number.NaN],
    ["a value that reads as no number is NaN", ["x"], Number.NaN],
    ["no argument is NaN", [], Number.NaN],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(truncFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

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
    ["a decimal comma reads as no number, so the result is undefined", ["1,5", 1], undefined],
    ["an empty first argument gives no result, even with a precision", [undefined, 2], undefined],
    ["a number written in exponent form is cut to zero at one decimal place", [1e-7, 1], 0],
    ["a value that reads as no number gives no result", ["x"], undefined],
    ["no argument gives no result", [], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(truncFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });

  test.each([
    ["a numeric text value truncates to its whole part", ["3.789"], 3],
    ["a negative value truncates toward zero", [-3.789], -3],
    ["a precision of zero gives the whole part", [3.789, 0], 3],
    ["an exponent-form text reads as its number before it is cut", ["2.5e-1", 1], 0.2],
    ["a 0.1 + 0.2 decimal keeps all its digits at seventeen places", [0.30000000000000004, 17], 0.30000000000000004],
    ["a 0.1 + 0.2 decimal cut to two places drops its float noise", [0.30000000000000004, 2], 0.3],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(truncFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

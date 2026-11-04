import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { sumFunction } from "#src/services/functions/sumFunction";
import { describe, expect, test } from "vitest";

describe(sumFunction, () => {
  test.each([
    ["adds integers", [1, 2, 3], 6],
    ["reads a number text as its number", [1, "2"], 3],
    ["skips a comma decimal, which is not a number", ["1,5", 1], 1],
    ["trims the float error of a decimal sum", [0.1, 0.2], 0.3],
    ["skips a boolean, so it adds nothing", [true, 1], 1],
    ["flattens an array among the values", [[1, [2, 3]], 4], 10],
    ["skips an unanswered value", [undefined, 1], 1],
    ["sums nothing to zero", [], 0],
    ["skips a text that is not a number", ["a", 1], 1],
    ["skips an empty text", ["", 1], 1],
    ["sums the numbers around a text that is not a number", ["a", 0.5], 0.5],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(sumFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

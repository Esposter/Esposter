import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { minFunction } from "#src/services/functions/minFunction";
import { describe, expect, test } from "vitest";

describe(minFunction, () => {
  test.each([
    ["finds the smallest number", [3, 1, 2], 1],
    ["compares two texts as text", ["b", "a"], "a"],
    ["keeps a text over a number it is not greater than", ["b", 5], "b"],
    ["compares a boolean as one or zero", [true, 2], true],
    ["compares a number text as its number", ["5", 3], 3],
    ["flattens an array among the values", [[4, 2, 9]], 2],
    ["skips an unanswered value", [undefined, 1], 1],
    ["is empty with no values", [], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(minFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

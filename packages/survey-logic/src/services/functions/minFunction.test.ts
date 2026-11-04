import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { minFunction } from "#src/services/functions/minFunction";
import { describe, expect, test } from "vitest";

describe(minFunction, () => {
  test.each([
    ["finds the smallest number", [3, 1, 2], 1],
    ["is empty when every value is a text", ["b", "a"], undefined],
    ["skips a text and takes the smallest number", ["b", 5], 5],
    ["skips a boolean and takes the smallest number", [true, 2], 2],
    ["compares a number text as its number", ["5", 3], 3],
    ["flattens an array among the values", [[4, 2, 9]], 2],
    ["skips an unanswered value", [undefined, 1], 1],
    ["is empty with no values", [], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(minFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

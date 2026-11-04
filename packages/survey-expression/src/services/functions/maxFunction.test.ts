import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { maxFunction } from "#src/services/functions/maxFunction";
import { describe, expect, test } from "vitest";

describe(maxFunction, () => {
  test.each([
    ["finds the largest number", [3, 1, 2], 3],
    ["is empty when every value is a text", ["b", "a"], undefined],
    ["skips a boolean and takes the largest number", [true, 0], 0],
    ["skips a comma decimal, which is not a number", ["1,5", 1], 1],
    ["is empty for an empty array", [[]], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(maxFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

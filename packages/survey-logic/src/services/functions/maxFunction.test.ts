import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { maxFunction } from "#src/services/functions/maxFunction";
import { describe, expect, test } from "vitest";

describe(maxFunction, () => {
  test.each([
    ["finds the largest number", [3, 1, 2], 3],
    ["compares two texts as text", ["b", "a"], "b"],
    ["compares a boolean as one or zero", [true, 0], true],
    ["reads a comma as the decimal point", ["1,5", 1], 1.5],
    ["is empty for an empty array", [[]], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(maxFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

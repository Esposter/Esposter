import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { iifFunction } from "#src/services/functions/iifFunction";
import { describe, expect, test } from "vitest";

describe(iifFunction, () => {
  test.each([
    ["returns the second value when the condition is truthy", [1, "a", "b"], "a"],
    ["returns the third value when the condition is zero", [0, "a", "b"], "b"],
    ["returns the third value when the condition is an empty text", ["", "a", "b"], "b"],
    ["returns the second value when the condition is the text zero", ["0", "a", "b"], "a"],
    ["treats an empty list as truthy", [[], 2, 3], 2],
    ["is empty when the condition is false and no third value is given", [0, "a"], undefined],
    ["is empty with fewer than two arguments", [1], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(iifFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

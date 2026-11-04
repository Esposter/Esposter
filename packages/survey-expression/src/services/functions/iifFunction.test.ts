import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { iifFunction } from "#src/services/functions/iifFunction";
import { describe, expect, test } from "vitest";

describe(iifFunction, () => {
  test.each([
    ["returns the second value when the condition is true", [true, "a", "b"], "a"],
    ["returns the third value when the condition is false", [false, "a", "b"], "b"],
    ["returns the third value when the condition is a number", [1, "a", "b"], "b"],
    ["returns the third value when the condition is zero", [0, "a", "b"], "b"],
    ["returns the third value when the condition is an empty text", ["", "a", "b"], "b"],
    ["returns the third value when the condition is the text true", ["true", "a", "b"], "b"],
    ["returns the third value when the condition is an empty list", [[], 2, 3], 3],
    ["is empty when the condition is false and no third value is given", [false, "a"], undefined],
    ["is empty with fewer than two arguments", [1], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(iifFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

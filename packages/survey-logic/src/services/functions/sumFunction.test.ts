import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { sumFunction } from "#src/services/functions/sumFunction";
import { describe, expect, test } from "vitest";

describe(sumFunction, () => {
  test.each([
    ["adds integers", [1, 2, 3], 6],
    ["reads a number text as its number", [1, "2"], 3],
    ["reads a comma as the decimal point", ["1,5", 1], 2.5],
    ["trims the float error of a decimal sum", [0.1, 0.2], 0.3],
    ["counts a boolean as one or zero", [true, 1], 2],
    ["flattens an array among the values", [[1, [2, 3]], 4], 10],
    ["skips an unanswered value", [undefined, 1], 1],
    ["sums nothing to zero", [], 0],
    ["joins a text that is not a number to the total as text", ["a", 1], "0a1"],
    ["joins an empty text to the total as text", ["", 1], "01"],
    ["is empty when a text total cannot be trimmed", ["a", 0.5], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(sumFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

import { avgFunction } from "#src/services/functions/avgFunction";
import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { describe, expect, test } from "vitest";

describe(avgFunction, () => {
  test.each([
    ["averages the values passed", [1, 2], 1.5],
    ["averages the values of an array among them", [[2, 4]], 3],
    ["averages decimals without the float error", [0.1, 0.2], 0.15],
    ["joins an empty text to the total as text and counts it in the divisor", ["", 5], 2.5],
    ["reads a text that is not a number as not a number", ["abc"], Number.NaN],
    ["averages nothing to zero", [], 0],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(avgFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

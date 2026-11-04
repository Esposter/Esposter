import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { substringFunction } from "#src/services/functions/substringFunction";
import { describe, expect, test } from "vitest";

describe(substringFunction, () => {
  test.each([
    ["takes the text between the two indices", ["hello", 1, 3], "el"],
    ["runs to the end of the text when no end is given", ["hello", 1], "ello"],
    ["reads number texts as indices", ["hello", "1", "3"], "el"],
    ["gives no result when the end is not a number", ["hello", 1, "x"], undefined],
    ["swaps the indices when the start is greater than the end", ["hello", 3, 1], "el"],
    ["gives no result when the start is not a number", ["hello", "x"], undefined],
    ["gives no result with no start", ["hello"], undefined],
    ["reads a number as its text, so a start at the end of that text is empty", [5, 1], ""],
    ["gives no result when the start is a list, even one holding a number", ["hello", ["1"], 3], undefined],
    ["gives no result when the start is a binary text, which is not a number", ["hello", "0b1", 3], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(substringFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });

  test.each([
    ["reads a numeric text start as its number", ["hello", "2"], "llo"],
    ["clamps a start past the end of the text to the end, so the part is empty", ["hello", 9], ""],
    ["clamps a negative start to zero", ["hello", -3, 2], "he"],
    ["truncates a fractional start toward zero", ["hello", 1.9, 3], "el"],
    ["gives the text between an end before the start, with the indices swapped", ["hello", 4, 1], "ell"],
    ["reads a numeric text end as its number", ["hello", 0, "2"], "he"],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(substringFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

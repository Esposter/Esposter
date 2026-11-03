import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { substringFunction } from "#src/services/functions/substringFunction";
import { describe, expect, test } from "vitest";

describe(substringFunction, () => {
  test.each([
    ["takes the text between the two indices", ["hello", 1, 3], "el"],
    ["runs to the end of the text when no end is given", ["hello", 1], "ello"],
    ["reads number texts as indices", ["hello", "1", "3"], "el"],
    ["runs to the end of the text when the end is not a number", ["hello", 1, "x"], "ello"],
    ["swaps the indices when the start is greater than the end", ["hello", 3, 1], "el"],
    ["is empty when the start is not a number", ["hello", "x"], ""],
    ["is empty with no start", ["hello"], ""],
    ["is empty when the text is not a text", [5, 1], ""],
    ["reads a list holding one number as that index", ["hello", ["1"], 3], "el"],
    ["reads a binary number text as its binary value", ["hello", "0b1", 3], "el"],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(substringFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

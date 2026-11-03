import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { countFunction } from "#src/services/functions/countFunction";
import { describe, expect, test } from "vitest";

describe(countFunction, () => {
  test.each([
    ["counts the values passed", [1, 2], 2],
    ["counts the values of an array among them", [[1, [2, 3]]], 3],
    ["counts an empty text", ["", 1], 2],
    ["does not count an unanswered value", [undefined, 1], 1],
    ["counts a record as one value", [{ k: 1 }], 1],
    ["counts nothing as zero", [], 0],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(countFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});

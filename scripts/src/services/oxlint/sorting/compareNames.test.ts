import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { describe, expect, test } from "vitest";

describe(compareNames, () => {
  test.each([
    ["item2", "item10", -1],
    ["Apple", "apple", 0],
    ["a b", "ab", 0],
    ["{", "A", -1],
  ])("%s compares with %s as %s", (left, right, expected) => {
    expect.hasAssertions();

    expect(Math.sign(compareNames(left, right))).toBe(expected);
  });
});

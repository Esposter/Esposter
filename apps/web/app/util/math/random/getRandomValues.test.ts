import { getRandomValues } from "@/util/math/random/getRandomValues";
import { describe, expect, test } from "vitest";

describe(getRandomValues, () => {
  test("empty array", () => {
    expect.hasAssertions();

    expect(getRandomValues([], 0)).toStrictEqual([]);
  });

  // Taking every value is a shuffle, so each one lands exactly once whatever order the draw picks them in
  test("takes each value once when taking them all", () => {
    expect.hasAssertions();

    expect(getRandomValues(["a", "b"], 2).toSorted()).toStrictEqual(["a", "b"]);
  });

  test("fails for invalid range", () => {
    expect.hasAssertions();

    expect(() => getRandomValues([], 0.1)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: ${getRandomValues.name}: taken length must be an integer]`,
    );
    expect(() => getRandomValues([], -1)).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: ${getRandomValues.name}: taken length is negative]`,
    );
    expect(() => getRandomValues([], 1)).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: ${getRandomValues.name}: more elements taken than available]`,
    );
  });
});

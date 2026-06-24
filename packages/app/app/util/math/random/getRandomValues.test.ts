import { getRandomValues } from "@/util/math/random/getRandomValues";
import { describe, expect, test } from "vitest";

describe(getRandomValues, () => {
  test("empty array", () => {
    expect.hasAssertions();

    expect(getRandomValues([], 0)).toStrictEqual([]);
  });

  test("gets", () => {
    expect.hasAssertions();

    expect(getRandomValues([""], 1)).toStrictEqual([""]);
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

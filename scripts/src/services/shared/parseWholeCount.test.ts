import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { describe, expect, test } from "vitest";

describe(parseWholeCount, () => {
  test("a whole number at or above the minimum is read as its count", () => {
    expect.hasAssertions();

    expect(parseWholeCount("0", "depth", 0)).toBe(0);
    expect(parseWholeCount("20", "limit", 1)).toBe(20);
  });

  test("a blank count is refused rather than read as 0", () => {
    expect.hasAssertions();

    expect(() => parseWholeCount("", "depth", 0)).toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Read, name: depth,  is not a whole number of 0 or more]`);
  });

  test("a fraction is refused rather than read", () => {
    expect.hasAssertions();

    expect(() => parseWholeCount("1.5", "depth", 0)).toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Read, name: depth, 1.5 is not a whole number of 0 or more]`);
  });
});

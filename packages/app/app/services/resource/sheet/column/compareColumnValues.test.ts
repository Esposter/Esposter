import { compareColumnValues } from "@/services/resource/sheet/column/compareColumnValues";
import { describe, expect, test } from "vitest";

describe(compareColumnValues, () => {
  test("orders numbers by magnitude", () => {
    expect.hasAssertions();

    expect(compareColumnValues(9, 10)).toBeLessThan(0);
    expect(compareColumnValues(10, 9)).toBeGreaterThan(0);
    expect(compareColumnValues(9, 9)).toBe(0);
  });

  test("orders booleans with false first", () => {
    expect.hasAssertions();

    expect(compareColumnValues(false, true)).toBeLessThan(0);
  });

  test("orders empty cells ahead of filled ones", () => {
    expect.hasAssertions();

    expect(compareColumnValues(null, 0)).toBeLessThan(0);
    expect(compareColumnValues(0, null)).toBeGreaterThan(0);
    expect(compareColumnValues(null, null)).toBe(0);
  });

  test("orders strings without regard to case", () => {
    expect.hasAssertions();

    expect(compareColumnValues("apple", "Banana")).toBeLessThan(0);
  });
});

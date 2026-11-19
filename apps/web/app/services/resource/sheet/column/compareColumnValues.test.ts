import { compareColumnValues } from "#src/services/resource/sheet/column/compareColumnValues";
import { describe, expect, test } from "vitest";

describe(compareColumnValues, () => {
  test("orders numbers by magnitude", () => {
    expect.hasAssertions();

    expect(compareColumnValues(9, 10)).toBe(-1);
    expect(compareColumnValues(10, 9)).toBe(1);
    expect(compareColumnValues(9, 9)).toBe(0);
  });

  test("orders booleans with false first", () => {
    expect.hasAssertions();

    expect(compareColumnValues(false, true)).toBe(-1);
  });

  test("orders empty cells ahead of filled ones", () => {
    expect.hasAssertions();

    expect(compareColumnValues(null, 0)).toBe(-1);
    expect(compareColumnValues(0, null)).toBe(1);
    expect(compareColumnValues(null, null)).toBe(0);
  });

  test("orders strings without regard to case", () => {
    expect.hasAssertions();

    expect(compareColumnValues("a", "B")).toBe(-1);
  });
});

import { snapToRange } from "#src/services/menu/snapToRange";
import { describe, expect, test } from "vitest";

const distanceRange = { max: 6, min: 4.5, step: 0.1 };
const sensitivityRange = { max: 5, min: 1, step: 1 };

describe(snapToRange, () => {
  test("a value between steps lands on the nearest step", () => {
    expect.hasAssertions();

    expect(snapToRange(5.26, distanceRange)).toBeCloseTo(5.3);
  });

  test("a value past either end stops at the range's limit", () => {
    expect.hasAssertions();

    expect(snapToRange(7, sensitivityRange)).toBe(5);
    expect(snapToRange(0, sensitivityRange)).toBe(1);
  });

  test("the range's ends are steps of their own", () => {
    expect.hasAssertions();

    expect(snapToRange(4.5, distanceRange)).toBe(4.5);
    expect(snapToRange(6, distanceRange)).toBe(6);
  });
});

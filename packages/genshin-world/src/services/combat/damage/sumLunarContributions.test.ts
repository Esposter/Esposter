import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { describe, expect, test } from "vitest";

describe(sumLunarContributions, () => {
  test("a Glimmer reaction weights its four highest contributors", () => {
    expect.hasAssertions();

    expect(sumLunarContributions([1, 4, 2, 3])).toBeCloseTo(4 * 0.6 + 3 * 0.3 + 2 * 0.05 + 1 * 0.05);
  });

  test("a Glimmer reaction with a lower contributor is not counted", () => {
    expect.hasAssertions();

    expect(sumLunarContributions([1, 4, 2, 3, 5])).toBeCloseTo(5 * 0.6 + 4 * 0.3 + 3 * 0.05 + 2 * 0.05);
  });
});

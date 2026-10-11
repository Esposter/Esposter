import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { describe, expect, test } from "vitest";

describe(sumLunarContributions, () => {
  test("weights the largest contribution 0.6, the next 0.3, the two after 0.05 and a fifth nothing", () => {
    expect.hasAssertions();

    expect(sumLunarContributions([1, 4, 2, 3, 5])).toBeCloseTo(5 * 0.6 + 4 * 0.3 + 3 * 0.05 + 2 * 0.05);
  });
});

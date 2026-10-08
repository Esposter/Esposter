import type { FishingWeight } from "#src/models/fishing/FishingWeight";

import { drawFishingWeight } from "#src/services/fishing/drawFishingWeight";
import { describe, expect, test } from "vitest";

describe(drawFishingWeight, () => {
  const FIRST_FISH_ID = 1;
  const SECOND_FISH_ID = 4;
  const weights: FishingWeight[] = [
    { fishId: FIRST_FISH_ID, weight: 300 },
    { fishId: SECOND_FISH_ID, weight: 100 },
  ];

  test("a roll falls to the fish whose share of the total its weight is, and a stock weighing nothing draws none", () => {
    expect.hasAssertions();

    expect(drawFishingWeight(weights, 0)).toBe(FIRST_FISH_ID);
    expect(drawFishingWeight(weights, 0.74)).toBe(FIRST_FISH_ID);
    expect(drawFishingWeight(weights, 0.75)).toBe(SECOND_FISH_ID);
    expect(drawFishingWeight([], 0)).toBeUndefined();
  });
});

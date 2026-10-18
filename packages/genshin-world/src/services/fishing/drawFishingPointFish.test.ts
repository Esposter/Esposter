import type { FishingPool } from "#src/models/fishing/FishingPool";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { drawFishingPointFish } from "#src/services/fishing/drawFishingPointFish";
import { describe, expect, test } from "vitest";

const createPool = (fishId: number): FishingPool => ({
  id: fishId,
  maxNum: 0,
  stocks: [{ type: FishingStockType.Any, weights: [{ fishId, weight: 1 }] }],
});

describe(drawFishingPointFish, () => {
  const REGION = "a";
  const OTHER_REGION = "b";
  const FIRST_FISH_ID = 1;
  const SECOND_FISH_ID = 2;
  const OTHER_FISH_ID = 3;
  const HOUR = 0;
  const FIRST_ROLL = 0;
  const LAST_ROLL = 0.9;

  test("a point draws from its region's pools", () => {
    expect.hasAssertions();

    const regionPools = {
      [OTHER_REGION]: [createPool(OTHER_FISH_ID)],
      [REGION]: [createPool(FIRST_FISH_ID), createPool(SECOND_FISH_ID)],
    };

    expect(drawFishingPointFish(regionPools, REGION, HOUR, FIRST_ROLL)).toBe(FIRST_FISH_ID);
    expect(drawFishingPointFish(regionPools, REGION, HOUR, LAST_ROLL)).toBe(SECOND_FISH_ID);
  });

  test("a point in a region with no pool draws nothing", () => {
    expect.hasAssertions();

    expect(
      drawFishingPointFish({ [OTHER_REGION]: [createPool(OTHER_FISH_ID)] }, REGION, HOUR, FIRST_ROLL),
    ).toBeUndefined();
  });
});

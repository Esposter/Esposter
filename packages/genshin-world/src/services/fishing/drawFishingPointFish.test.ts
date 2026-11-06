import type { FishingPool } from "#src/models/fishing/FishingPool";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { computeStandingFishingStocks } from "#src/services/fishing/computeStandingFishingStocks";
import { drawFishingPointFish } from "#src/services/fishing/drawFishingPointFish";
import { getFishingStockKey } from "#src/services/fishing/getFishingStockKey";
import { describe, expect, test } from "vitest";

const createPool = (id: number, fishId: number): FishingPool => ({
  id,
  maxNum: 1,
  stocks: [{ type: FishingStockType.Any, weights: [{ fishId, weight: 1 }] }],
});

describe(drawFishingPointFish, () => {
  const REGION = "a";
  const FIRST_FISH_ID = 1;
  const SECOND_FISH_ID = 2;
  const OTHER_FISH_ID = 3;
  const FIRST_POOL_ID = 1;
  const SECOND_POOL_ID = 2;
  const HOUR = 0;
  const FIRST_ROLL = 0;
  const LAST_ROLL = 0.9;
  const BAITED_FISH_IDS = new Set([FIRST_FISH_ID, SECOND_FISH_ID]);
  const CAUGHT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const FIRST_STOCK_KEY = getFishingStockKey(FIRST_POOL_ID, FishingStockType.Any);
  const TWO_POOLS = {
    [REGION]: [createPool(FIRST_POOL_ID, FIRST_FISH_ID), createPool(SECOND_POOL_ID, SECOND_FISH_ID)],
  };

  test("a point draws from its region's pools", () => {
    expect.hasAssertions();

    const standingStocks = computeStandingFishingStocks(TWO_POOLS, REGION, HOUR, new Map(), CAUGHT_AT);

    expect(drawFishingPointFish(standingStocks, FIRST_ROLL, BAITED_FISH_IDS)).toStrictEqual({
      fishId: FIRST_FISH_ID,
      stockKey: FIRST_STOCK_KEY,
      weight: 1,
    });
    expect(drawFishingPointFish(standingStocks, LAST_ROLL, BAITED_FISH_IDS)?.fishId).toBe(SECOND_FISH_ID);
  });

  test("a fish is drawn only by its own bait", () => {
    expect.hasAssertions();

    const standingStocks = computeStandingFishingStocks(TWO_POOLS, REGION, HOUR, new Map(), CAUGHT_AT);

    expect(drawFishingPointFish(standingStocks, LAST_ROLL, new Set([FIRST_FISH_ID]))?.fishId).toBe(FIRST_FISH_ID);
  });

  test("a cast with another bait draws none of a fish's kind", () => {
    expect.hasAssertions();

    const standingStocks = computeStandingFishingStocks(
      { [REGION]: [createPool(FIRST_POOL_ID, FIRST_FISH_ID)] },
      REGION,
      HOUR,
      new Map(),
      CAUGHT_AT,
    );

    expect(drawFishingPointFish(standingStocks, FIRST_ROLL, new Set([OTHER_FISH_ID]))).toBeUndefined();
  });
});

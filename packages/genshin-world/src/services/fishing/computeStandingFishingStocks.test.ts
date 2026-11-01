import type { FishingPool } from "#src/models/fishing/FishingPool";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { computeFishingCatchAts } from "#src/services/fishing/computeFishingCatchAts";
import { computeStandingFishingStocks } from "#src/services/fishing/computeStandingFishingStocks";
import { FISH_RESPAWN_DURATION } from "#src/services/fishing/constants";
import { getFishingStockKey } from "#src/services/fishing/getFishingStockKey";
import { describe, expect, test } from "vitest";

describe(computeStandingFishingStocks, () => {
  const REGION = "a";
  const DAY_HOUR = 12;
  const NIGHT_HOUR = 23;
  const FISH_ID = 1;
  const OTHER_FISH_ID = 2;
  const POOL_ID = 1;
  const OTHER_POOL_ID = 2;
  const MAX_NUM = 1;
  const CAUGHT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const RETURNED_AT = CAUGHT_AT.add(FISH_RESPAWN_DURATION);
  const DAY_KEY = getFishingStockKey(POOL_ID, FishingStockType.Day);
  const NIGHT_KEY = getFishingStockKey(POOL_ID, FishingStockType.Night);
  const OTHER_KEY = getFishingStockKey(OTHER_POOL_ID, FishingStockType.Any);
  const POOLS: Record<string, FishingPool[]> = {
    [REGION]: [
      {
        id: POOL_ID,
        maxNum: MAX_NUM,
        stocks: [
          { type: FishingStockType.Day, weights: [{ fishId: FISH_ID, weight: 1 }] },
          { type: FishingStockType.Night, weights: [{ fishId: FISH_ID, weight: 1 }] },
        ],
      },
      {
        id: OTHER_POOL_ID,
        maxNum: MAX_NUM,
        stocks: [{ type: FishingStockType.Any, weights: [{ fishId: OTHER_FISH_ID, weight: 1 }] }],
      },
    ],
  };

  test("a catch empties only its own stock, so the day's and the night's stocks of a pool and the other pools stand apart", () => {
    expect.hasAssertions();

    const caughtAtMap = computeFishingCatchAts(new Map(), NIGHT_KEY, CAUGHT_AT);

    expect(
      computeStandingFishingStocks(POOLS, REGION, NIGHT_HOUR, caughtAtMap, CAUGHT_AT).map(({ stockKey }) => stockKey),
    ).toStrictEqual([OTHER_KEY]);
    expect(
      computeStandingFishingStocks(POOLS, REGION, DAY_HOUR, caughtAtMap, CAUGHT_AT).map(({ stockKey }) => stockKey),
    ).toStrictEqual([DAY_KEY, OTHER_KEY]);
  });

  test("a region whose every stock is emptied stands no stock until the first catch returns seventy-two hours later", () => {
    expect.hasAssertions();

    const caughtAtMap = [DAY_KEY, NIGHT_KEY, OTHER_KEY].reduce(
      (nextCaughtAtMap, stockKey) => computeFishingCatchAts(nextCaughtAtMap, stockKey, CAUGHT_AT),
      new Map<string, Temporal.Instant[]>(),
    );

    expect(computeStandingFishingStocks(POOLS, REGION, DAY_HOUR, caughtAtMap, CAUGHT_AT)).toStrictEqual([]);
    expect(
      computeStandingFishingStocks(POOLS, REGION, DAY_HOUR, caughtAtMap, RETURNED_AT.subtract({ milliseconds: 1 })),
    ).toStrictEqual([]);
    expect(
      computeStandingFishingStocks(POOLS, REGION, DAY_HOUR, caughtAtMap, RETURNED_AT).map(({ stockKey }) => stockKey),
    ).toStrictEqual([DAY_KEY, OTHER_KEY]);
  });

  test("a region with no pool stands no stock", () => {
    expect.hasAssertions();

    expect(computeStandingFishingStocks({}, REGION, DAY_HOUR, new Map(), CAUGHT_AT)).toStrictEqual([]);
  });
});

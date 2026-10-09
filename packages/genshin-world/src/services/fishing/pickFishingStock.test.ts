import type { FishingPool } from "#src/models/fishing/FishingPool";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { FISHING_DAY_START_HOUR, FISHING_NIGHT_START_HOUR } from "#src/services/fishing/constants";
import { pickFishingStock } from "#src/services/fishing/pickFishingStock";
import { describe, expect, test } from "vitest";

describe(pickFishingStock, () => {
  const dayStock = { type: FishingStockType.Day, weights: [] };
  const nightStock = { type: FishingStockType.Night, weights: [] };
  const anyStock = { type: FishingStockType.Any, weights: [] };

  test("a pool with a day and a night stock draws the day's from the day start until the night start", () => {
    expect.hasAssertions();

    const pool: FishingPool = { id: 1, maxNum: 1, stocks: [dayStock, nightStock] };

    expect(pickFishingStock(pool, FISHING_DAY_START_HOUR)).toBe(dayStock);
    expect(pickFishingStock(pool, FISHING_NIGHT_START_HOUR - 1)).toBe(dayStock);
    expect(pickFishingStock(pool, FISHING_NIGHT_START_HOUR)).toBe(nightStock);
    expect(pickFishingStock(pool, FISHING_DAY_START_HOUR - 1)).toBe(nightStock);
  });

  test("a pool whose stock holds at every hour draws it at any time, and a pool with no stock for the time draws none", () => {
    expect.hasAssertions();

    expect(pickFishingStock({ id: 1, maxNum: 1, stocks: [anyStock] }, FISHING_NIGHT_START_HOUR)).toBe(anyStock);
    expect(pickFishingStock({ id: 1, maxNum: 1, stocks: [dayStock] }, FISHING_NIGHT_START_HOUR)).toBeUndefined();
  });
});

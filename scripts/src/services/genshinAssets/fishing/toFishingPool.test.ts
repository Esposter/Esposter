import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";

import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";
import { FishingStockType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toFishingPool, () => {
  const POOL_ID = 1001;
  const MAX_NUM = 4;
  const DAY_STOCK_ID = 10_011;
  const NIGHT_STOCK_ID = 10_012;
  const stocks = new Map<number, ExcelFishStockRow>([
    [DAY_STOCK_ID, { fishWeight: { "1": 300, "4": 100 }, id: DAY_STOCK_ID, type: FishingStockType.Day }],
    [NIGHT_STOCK_ID, { fishWeight: { "5": 50 }, id: NIGHT_STOCK_ID, type: FishingStockType.Night }],
  ]);

  test("a pool's stocks come back in the order its list names them, each weight under its fish's id as a number", () => {
    expect.hasAssertions();

    const row: ExcelFishPoolRow = {
      cityId: 1,
      id: POOL_ID,
      maxNum: MAX_NUM,
      stockList: [NIGHT_STOCK_ID, DAY_STOCK_ID],
    };

    expect(toFishingPool(row, stocks)).toStrictEqual({
      id: POOL_ID,
      maxNum: MAX_NUM,
      stocks: [
        { type: FishingStockType.Night, weights: [{ fishId: 5, weight: 50 }] },
        {
          type: FishingStockType.Day,
          weights: [
            { fishId: 1, weight: 300 },
            { fishId: 4, weight: 100 },
          ],
        },
      ],
    });
  });

  test("a stock the table does not hold is an error rather than a pool missing it", () => {
    expect.hasAssertions();

    const row: ExcelFishPoolRow = { cityId: 1, id: POOL_ID, maxNum: MAX_NUM, stockList: [DAY_STOCK_ID, 0] };

    expect(() => toFishingPool(row, stocks)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: fishing stock, stock 0 is not in the stock table]`,
    );
  });
});

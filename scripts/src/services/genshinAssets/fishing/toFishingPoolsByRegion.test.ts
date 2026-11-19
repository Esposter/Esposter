import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";

import { toFishingPoolsByRegion } from "#src/services/genshinAssets/fishing/toFishingPoolsByRegion";
import { toCityRegionMap } from "#src/services/genshinAssets/shared/toCityRegionMap";
import { FishingStockType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toFishingPoolsByRegion, () => {
  const NOD_KRAI_CITY_ID = 7;
  const NOD_KRAI_AREA_ID = 70;
  const NO_CITY_ID = 0;
  const POOL_ID = 7001;
  const DAY_STOCK_ID = 10_011;
  const stocks = new Map<number, ExcelFishStockRow>([
    [DAY_STOCK_ID, { fishWeight: { "1": 300 }, id: DAY_STOCK_ID, type: FishingStockType.Day }],
  ]);
  const cityRegionMap = toCityRegionMap(
    [{ areaIdVec: [NOD_KRAI_AREA_ID], cityId: NOD_KRAI_CITY_ID, cityNameTextMapHash: 1 }],
    new Map([[NOD_KRAI_AREA_ID, { areaId: "paha-isle", region: "nod-krai" }]]),
  );

  test("a Nod-Krai fishing pool is filed under nod-krai, and a pool of a city no region holds is left out and counted", () => {
    expect.hasAssertions();

    const rows: ExcelFishPoolRow[] = [
      { cityId: NOD_KRAI_CITY_ID, excludeFish: [], id: POOL_ID, maxNum: 4, stockList: [DAY_STOCK_ID] },
      { cityId: NO_CITY_ID, excludeFish: [], id: POOL_ID + 1, maxNum: 4, stockList: [DAY_STOCK_ID] },
    ];

    expect(toFishingPoolsByRegion(rows, stocks, cityRegionMap)).toStrictEqual({
      regionPools: {
        "nod-krai": [
          { id: POOL_ID, maxNum: 4, stocks: [{ type: FishingStockType.Day, weights: [{ fishId: 1, weight: 300 }] }] },
        ],
      },
      skippedPools: 1,
    });
  });
});

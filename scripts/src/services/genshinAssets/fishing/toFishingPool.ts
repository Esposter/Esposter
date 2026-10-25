import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { FishingPool } from "genshin-world";

import { toFishingStock } from "#src/services/genshinAssets/fishing/toFishingStock";

// A pool of the game's table as the world reads it: each stock on its list resolved to its table row, with each fish's
// Weight in the table's order. A stock the table does not hold is an error, never a pool missing a stock
export const toFishingPool = (row: ExcelFishPoolRow, stocks: ReadonlyMap<number, ExcelFishStockRow>): FishingPool => ({
  id: row.id,
  maxNum: row.maxNum,
  stocks: row.stockList.map((stockId) => toFishingStock(stockId, stocks)),
});

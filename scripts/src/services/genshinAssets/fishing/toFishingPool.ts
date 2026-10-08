import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { FishingPool, FishingStock } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

const toFishingStock = (stockId: number, stocks: ReadonlyMap<number, ExcelFishStockRow>): FishingStock => {
  const stock = stocks.get(stockId);
  if (stock === undefined)
    throw new InvalidOperationError(Operation.Read, "fishing stock", `stock ${stockId} is not in the stock table`);
  return {
    type: stock.type,
    weights: Object.entries(stock.fishWeight).map(([fishId, weight]) => ({ fishId: Number(fishId), weight })),
  };
};

// A pool of the game's table as the world reads it: each stock on its list resolved to its table row, with each fish's
// Weight in the table's order. A stock the table does not hold is an error, never a pool missing a stock
export const toFishingPool = (row: ExcelFishPoolRow, stocks: ReadonlyMap<number, ExcelFishStockRow>): FishingPool => ({
  id: row.id,
  maxNum: row.maxNum,
  stocks: row.stockList.map((stockId) => toFishingStock(stockId, stocks)),
});

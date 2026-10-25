import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { FishingStock } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const toFishingStock = (stockId: number, stocks: ReadonlyMap<number, ExcelFishStockRow>): FishingStock => {
  const stock = stocks.get(stockId);
  if (stock === undefined)
    throw new InvalidOperationError(Operation.Read, "fishing stock", `stock ${stockId} is not in the stock table`);
  return {
    type: stock.type,
    weights: Object.entries(stock.fishWeight).map(([fishId, weight]) => ({ fishId: Number(fishId), weight })),
  };
};

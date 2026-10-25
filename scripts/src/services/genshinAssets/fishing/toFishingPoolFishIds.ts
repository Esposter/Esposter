import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";

import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";

// The fish a pool draws: the fish of every stock on its list, less the ones it excludes
export const toFishingPoolFishIds = (
  row: ExcelFishPoolRow,
  stocks: ReadonlyMap<number, ExcelFishStockRow>,
): ReadonlySet<number> => {
  const excluded = new Set(row.excludeFish);
  return new Set(
    toFishingPool(row, stocks)
      .stocks.flatMap(({ weights }) => weights.map(({ fishId }) => fishId))
      .filter((fishId) => !excluded.has(fishId)),
  );
};

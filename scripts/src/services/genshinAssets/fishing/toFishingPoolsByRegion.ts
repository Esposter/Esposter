import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { FishingPool } from "genshin-world";

import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";

// Each region's pools, every pool filed under the region its city is in. A pool whose city no region holds is left out
// And counted, so the notes say how many
export const toFishingPoolsByRegion = (
  poolRows: readonly ExcelFishPoolRow[],
  stocks: ReadonlyMap<number, ExcelFishStockRow>,
  cityRegionMap: ReadonlyMap<number, string>,
): { regionPools: Record<string, FishingPool[]>; skippedPools: number } => {
  const regionPools: Record<string, FishingPool[]> = {};
  let skippedPools = 0;
  for (const row of poolRows) {
    const region = cityRegionMap.get(row.cityId);
    if (region === undefined) {
      skippedPools++;
      continue;
    }
    regionPools[region] = [...(regionPools[region] ?? []), toFishingPool(row, stocks)];
  }
  return { regionPools, skippedPools };
};

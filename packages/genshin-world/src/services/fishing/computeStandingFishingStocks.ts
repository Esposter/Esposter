import type { FishingPool } from "#src/models/fishing/FishingPool";
import type { StandingFishingStock } from "#src/models/fishing/StandingFishingStock";

import { countFishingStock } from "#src/services/fishing/countFishingStock";
import { getFishingStockKey } from "#src/services/fishing/getFishingStockKey";
import { pickFishingStock } from "#src/services/fishing/pickFishingStock";

// The stocks a region's pools hold at an hour that still have fish left: each pool's stock drawn at the hour, unless its
// Catches have emptied it. A region with none standing draws nothing, and its fishing points are withheld
export const computeStandingFishingStocks = (
  regionPools: Readonly<Record<string, readonly FishingPool[]>>,
  region: string,
  hour: number,
  caughtAtMap: ReadonlyMap<string, readonly Temporal.Instant[]>,
  now: Temporal.Instant,
): StandingFishingStock[] =>
  (regionPools[region] ?? []).flatMap((pool) => {
    const stock = pickFishingStock(pool, hour);
    if (stock === undefined) return [];
    const stockKey = getFishingStockKey(pool.id, stock.type);
    const isStanding = countFishingStock(pool.maxNum, caughtAtMap.get(stockKey) ?? [], now) > 0;
    return isStanding ? [{ stockKey, weights: stock.weights }] : [];
  });

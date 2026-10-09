import type { FishingPool } from "#src/models/fishing/FishingPool";
import type { FishingStock } from "#src/models/fishing/FishingStock";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { FISHING_DAY_START_HOUR, FISHING_NIGHT_START_HOUR } from "#src/services/fishing/constants";

// The stock a pool draws from at an hour of the game's day: the one held at every hour, or the day's between the day's
// And the night's start and the night's otherwise. Undefined where the pool holds no stock for that time
export const pickFishingStock = (pool: FishingPool, hour: number): FishingStock | undefined => {
  const isDay = hour >= FISHING_DAY_START_HOUR && hour < FISHING_NIGHT_START_HOUR;
  const timedType = isDay ? FishingStockType.Day : FishingStockType.Night;
  return pool.stocks.find(({ type }) => type === FishingStockType.Any || type === timedType);
};

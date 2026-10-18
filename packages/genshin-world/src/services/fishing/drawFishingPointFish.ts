import type { FishingPool } from "#src/models/fishing/FishingPool";

import { drawFishingWeight } from "#src/services/fishing/drawFishingWeight";
import { pickFishingStock } from "#src/services/fishing/pickFishingStock";

// The fish a fishing point draws for a roll in [0, 1) at an hour of the game's day: every pool of its region holds the
// Stock it draws at that hour, and the weights of them all are drawn as one. Undefined where the region has no pool, or
// None of its pools holds a stock at the hour
export const drawFishingPointFish = (
  regionPools: Readonly<Record<string, readonly FishingPool[]>>,
  region: string,
  hour: number,
  roll: number,
): number | undefined =>
  drawFishingWeight(
    (regionPools[region] ?? []).flatMap((pool) => pickFishingStock(pool, hour)?.weights ?? []),
    roll,
  );

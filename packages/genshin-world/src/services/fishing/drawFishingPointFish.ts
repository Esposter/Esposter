import type { FishingPool } from "#src/models/fishing/FishingPool";

import { drawFishingWeight } from "#src/services/fishing/drawFishingWeight";
import { pickFishingStock } from "#src/services/fishing/pickFishingStock";

// The fish a fishing point draws for a roll in [0, 1) at an hour of the game's day: every pool of its region holds the
// Stock it draws at that hour, and the weights of them all are drawn as one, only among the fish the bait names.
// Undefined where the region has no pool, or none of its pools holds a stock at the hour with a fish the bait names
export const drawFishingPointFish = (
  regionPools: Readonly<Record<string, readonly FishingPool[]>>,
  region: string,
  hour: number,
  roll: number,
  baitFishIds: ReadonlySet<number>,
): number | undefined =>
  drawFishingWeight(
    (regionPools[region] ?? [])
      .flatMap((pool) => pickFishingStock(pool, hour)?.weights ?? [])
      .filter(({ fishId }) => baitFishIds.has(fishId)),
    roll,
  );

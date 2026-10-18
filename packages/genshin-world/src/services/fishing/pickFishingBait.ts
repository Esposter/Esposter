import type { FishBait } from "#src/models/fishing/FishBait";
import type { FishingPool } from "#src/models/fishing/FishingPool";

import { drawFishingPointFish } from "#src/services/fishing/drawFishingPointFish";

// The bait a cast uses when the player has chosen none: the first of the baits held, in the bag's order, that pulls a fish
// At the point at the hour, its pools drawing only among the fish the bait names. Undefined where no held bait pulls one
export const pickFishingBait = (
  heldBaits: readonly FishBait[],
  regionPools: Readonly<Record<string, readonly FishingPool[]>>,
  region: string,
  hour: number,
): FishBait | undefined =>
  heldBaits.find(({ fishIds }) => drawFishingPointFish(regionPools, region, hour, 0, new Set(fishIds)) !== undefined);

import type { FishBait } from "#src/models/fishing/FishBait";
import type { StandingFishingStock } from "#src/models/fishing/StandingFishingStock";

import { drawFishingPointFish } from "#src/services/fishing/drawFishingPointFish";

// The bait a cast uses when the player has chosen none: the first of the baits held, in the bag's order, that pulls a fish
// From the point's standing stocks, drawing only among the fish the bait names. Undefined where no held bait pulls one
export const pickFishingBait = (
  heldBaits: readonly FishBait[],
  standingStocks: readonly StandingFishingStock[],
): FishBait | undefined =>
  heldBaits.find(({ fishIds }) => drawFishingPointFish(standingStocks, 0, new Set(fishIds)) !== undefined);

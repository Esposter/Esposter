import type { FishingStockWeight } from "#src/models/fishing/FishingStockWeight";
import type { StandingFishingStock } from "#src/models/fishing/StandingFishingStock";

import { drawFishingWeight } from "#src/services/fishing/drawFishingWeight";

// The fish a fishing point draws for a roll in [0, 1).
// The weights of every stock standing in its region's pools are drawn as one, each tagged with the stock it is in.
// Only the fish the bait names are drawn among.
// Undefined where no standing stock holds a fish the bait names.
export const drawFishingPointFish = (
  standingStocks: readonly StandingFishingStock[],
  roll: number,
  baitFishIds: ReadonlySet<number>,
): FishingStockWeight | undefined =>
  drawFishingWeight(
    standingStocks
      .flatMap(({ stockKey, weights }) => weights.map((weight) => ({ ...weight, stockKey })))
      .filter(({ fishId }) => baitFishIds.has(fishId)),
    roll,
  );

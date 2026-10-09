import type { Fish } from "#src/models/fishing/Fish";

import { FishReaction } from "#src/models/fishing/FishReaction";

// How a fish answers a lure `distance` away: it flees a lure within its flee range, turns toward a lure of the bait it
// Takes within its attract range, and ignores any other
export const computeFishReaction = (
  fish: Pick<Fish, "attractRange" | "fleeRange">,
  distance: number,
  isBaitTaken: boolean,
): FishReaction => {
  if (distance <= fish.fleeRange) return FishReaction.Flees;
  if (isBaitTaken && distance <= fish.attractRange) return FishReaction.Turns;
  return FishReaction.Ignores;
};

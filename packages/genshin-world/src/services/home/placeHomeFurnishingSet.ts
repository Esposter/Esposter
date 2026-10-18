import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { placeHomeFurnishing } from "#src/services/home/placeHomeFurnishing";

// The realm's placements with a whole furnishing set added: each of the set's furnishings is placed in turn, so the set is
// Placed whole or not at all. Undefined as soon as one of them would not be placed, and nothing is placed then
export const placeHomeFurnishingSet = (
  placements: HomePlacement[],
  set: HomePlacement[],
  { areas, furnishings }: { areas: HomeArea[]; furnishings: HomeFurnishing[] },
): HomePlacement[] | undefined => {
  let nextPlacements = placements;
  for (const placement of set) {
    const placed = placeHomeFurnishing(nextPlacements, placement, { areas, furnishings });
    if (placed === undefined) return undefined;
    nextPlacements = placed;
  }
  return nextPlacements;
};

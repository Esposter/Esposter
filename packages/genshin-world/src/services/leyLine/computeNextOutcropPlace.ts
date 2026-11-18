import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { computeGroundDistanceSquared } from "genshin-engine";

// The place a claimed outcrop moves to: the nearest fitted place of its region but its own, and not the one the other
// Kind stands at, the nearer of two equally near taken by its id. Undefined where no place is free, so the outcrop
// Stays where it is until the daily reset. Provisional until the dump's place chain is joined to the fitted places
export const computeNextOutcropPlace = (
  placements: OutcropPlacement[],
  placeId: number,
  otherKindPlaceId: number | undefined,
): number | undefined => {
  const from = placements.find(({ id }) => id === placeId);
  if (!from) return undefined;
  return placements
    .filter(({ id }) => id !== placeId && id !== otherKindPlaceId)
    .toSorted(
      (firstPlacement, secondPlacement) =>
        computeGroundDistanceSquared(from.position, firstPlacement.position) -
          computeGroundDistanceSquared(from.position, secondPlacement.position) ||
        firstPlacement.id - secondPlacement.id,
    )[0]?.id;
};

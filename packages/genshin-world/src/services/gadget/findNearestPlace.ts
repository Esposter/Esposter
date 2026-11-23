import type { GroundPoint } from "genshin-engine";

import { computeGroundDistanceSquared } from "genshin-engine";

// The place nearest the position on the ground. None when there are no places.
// A detector with nothing left to point to points to nothing.
export const findNearestPlace = <Place extends { position: GroundPoint }>(
  places: readonly Place[],
  position: GroundPoint,
): Place | undefined => {
  let nearest: Place | undefined;
  let nearestDistanceSquared = Infinity;
  for (const place of places) {
    const distanceSquared = computeGroundDistanceSquared(place.position, position);
    if (distanceSquared < nearestDistanceSquared) {
      nearest = place;
      nearestDistanceSquared = distanceSquared;
    }
  }
  return nearest;
};

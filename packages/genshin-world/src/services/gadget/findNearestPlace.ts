import type { GroundPoint } from "genshin-engine";

// The place nearest the position on the ground. None when there are no places, so a detector with nothing left to point to
// Points to nothing
export const findNearestPlace = <Place extends { position: GroundPoint }>(
  places: readonly Place[],
  position: GroundPoint,
): Place | undefined => {
  let nearest: Place | undefined;
  let nearestDistanceSquared = Infinity;
  for (const place of places) {
    const { x, z } = place.position;
    const distanceSquared = (x - position.x) ** 2 + (z - position.z) ** 2;
    if (distanceSquared < nearestDistanceSquared) {
      nearest = place;
      nearestDistanceSquared = distanceSquared;
    }
  }
  return nearest;
};

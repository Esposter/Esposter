import type { Landmark } from "#src/models/world/Landmark";
import type { GroundPoint } from "genshin-engine";

import { computeLandmarkDistance } from "#src/services/map/computeLandmarkDistance";

// The landmark standing nearest a point on the ground within the max distance, or none when no landmark is that near
export const findNearestLandmark = (
  landmarks: readonly Landmark[],
  point: GroundPoint,
  maxDistance = Infinity,
): Landmark | undefined => {
  let nearestLandmark: Landmark | undefined;
  let nearestDistance = Infinity;
  for (const landmark of landmarks) {
    const distance = computeLandmarkDistance(landmark, point);
    if (distance <= maxDistance && distance < nearestDistance) {
      nearestLandmark = landmark;
      nearestDistance = distance;
    }
  }
  return nearestLandmark;
};

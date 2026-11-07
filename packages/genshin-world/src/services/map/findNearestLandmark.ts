import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { GroundPoint } from "genshin-engine";

import { computeLandmarkDistance } from "#src/services/map/computeLandmarkDistance";

// The landmark standing nearest a point on the ground within the max distance, or none when no landmark is that near
export const findNearestLandmark = (
  landmarks: readonly PlaceLandmark[],
  point: GroundPoint,
  maxDistance = Infinity,
): PlaceLandmark | undefined => {
  let nearestLandmark: PlaceLandmark | undefined;
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

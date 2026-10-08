import type { Landmark } from "#src/models/world/Landmark";
import type { GroundPoint } from "genshin-engine";

// The landmark standing nearest a point on the ground, or none when no landmark is loaded
export const findNearestLandmark = (landmarks: readonly Landmark[], point: GroundPoint): Landmark | undefined => {
  let nearestLandmark: Landmark | undefined;
  let nearestDistance = Infinity;
  for (const landmark of landmarks) {
    const distance = Math.hypot(landmark.position.x - point.x, landmark.position.z - point.z);
    if (distance < nearestDistance) {
      nearestLandmark = landmark;
      nearestDistance = distance;
    }
  }
  return nearestLandmark;
};

import type { GroundPoint } from "genshin-engine";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The catalogue area of the landmark nearest a place in its region, which a resident is filed under, since the game's
// Records give a place and no area. A region with no landmark has no area to file one under, which is an error
export const findNearestLandmarkAreaId = (
  region: string,
  landmarks: readonly { areaId: string; position: GroundPoint }[],
  position: GroundPoint,
): string => {
  const nearest = findNearest(landmarks, (landmark) =>
    Math.hypot(landmark.position.x - position.x, landmark.position.z - position.z),
  );
  if (!nearest) throw new InvalidOperationError(Operation.Read, region, "has no landmark to file a resident under");
  return nearest.areaId;
};

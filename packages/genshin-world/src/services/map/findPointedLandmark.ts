import type { Landmark } from "#src/models/world/Landmark";
import type { GroundPoint } from "genshin-engine";

import { NAVIGATION_POINTER_HIDE_DISTANCE, NAVIGATION_POINTER_SHOW_DISTANCE } from "#src/services/map/constants";
import { computeLandmarkDistance } from "#src/services/map/computeLandmarkDistance";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";

// The locked jump landmark the HUD points to from the character's ground point: the one pointed to last while it is still
// Locked and within the hide distance, otherwise the nearest locked one within the show distance, or none
export const findPointedLandmark = (
  lockedLandmarks: readonly Landmark[],
  point: GroundPoint,
  pointedLandmarkId: string | undefined,
): Landmark | undefined => {
  const heldLandmark = lockedLandmarks.find(({ id }) => id === pointedLandmarkId);
  if (heldLandmark && computeLandmarkDistance(heldLandmark, point) <= NAVIGATION_POINTER_HIDE_DISTANCE)
    return heldLandmark;
  return findNearestLandmark(lockedLandmarks, point, NAVIGATION_POINTER_SHOW_DISTANCE);
};

import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { GroundPoint } from "genshin-engine";

import { NAVIGATION_POINTER_HIDE_DISTANCE, NAVIGATION_POINTER_SHOW_DISTANCE } from "#src/services/map/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { computeGroundDistance } from "genshin-engine";

// The locked jump landmark the HUD points to from the character's ground point: the one pointed to last while it is
// Still locked and within the hide distance, otherwise the nearest locked one within the show distance, or none
export const findPointedLandmark = (
  lockedLandmarks: readonly PlaceLandmark[],
  point: GroundPoint,
  pointedLandmarkId: string | undefined,
): PlaceLandmark | undefined => {
  const heldLandmark = lockedLandmarks.find(({ id }) => id === pointedLandmarkId);
  if (heldLandmark && computeGroundDistance(heldLandmark.position, point) <= NAVIGATION_POINTER_HIDE_DISTANCE)
    return heldLandmark;
  return findNearestLandmark(lockedLandmarks, point, NAVIGATION_POINTER_SHOW_DISTANCE);
};

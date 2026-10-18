import type { Landmark } from "#src/models/world/Landmark";
import type { GroundPoint } from "genshin-engine";

import { NAVIGATION_POINTER_HIDE_DISTANCE, NAVIGATION_POINTER_SHOW_DISTANCE } from "#src/services/map/constants";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";

// The locked jump landmark the HUD points to from the character's ground point: the one pointed to last while it is still
// Locked and within the hide distance, otherwise the nearest locked one within the show distance, or none
export const findPointedLandmark = (
  lockedLandmarks: readonly Landmark[],
  point: GroundPoint,
  pointedLandmarkId: string | undefined,
): Landmark | undefined => {
  const distanceTo = ({ position }: Landmark) => Math.hypot(position.x - point.x, position.z - point.z);
  const heldLandmark = lockedLandmarks.find(({ id }) => id === pointedLandmarkId);
  if (heldLandmark && distanceTo(heldLandmark) <= NAVIGATION_POINTER_HIDE_DISTANCE) return heldLandmark;
  const nearestLandmark = findNearestLandmark(lockedLandmarks, point);
  return nearestLandmark && distanceTo(nearestLandmark) <= NAVIGATION_POINTER_SHOW_DISTANCE
    ? nearestLandmark
    : undefined;
};

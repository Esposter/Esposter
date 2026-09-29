import type { Vector3 } from "three";

// The floating origin's step: once the camera is farther than the threshold from the scene's origin across the
// Ground, the whole world is moved back under it by its horizontal position, rounded to a whole step so tile edges
// Stay on whole numbers. Returns whether a shift is owed, written into the vector it is given; height is never
// Shifted, since a continent is far wider than it is tall
export const computeOriginShift = (
  cameraPosition: Vector3,
  threshold: number,
  step: number,
  shift: Vector3,
): boolean => {
  if (Math.hypot(cameraPosition.x, cameraPosition.z) <= threshold) return false;
  shift.set(Math.round(cameraPosition.x / step) * step, 0, Math.round(cameraPosition.z / step) * step);
  return true;
};

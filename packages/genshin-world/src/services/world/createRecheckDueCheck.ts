import { REGION_RECHECK_DISTANCE } from "#src/services/constants";

// A check of whether the camera, at a ground point, has moved far enough from where it was last checked to check again.
// The point a due check stands at is kept, so a check that is not due compares against the last one that was
export const createRecheckDueCheck = () => {
  let checkedX = Infinity;
  let checkedZ = Infinity;
  return (x: number, z: number): boolean => {
    if (Math.hypot(x - checkedX, z - checkedZ) < REGION_RECHECK_DISTANCE) return false;
    checkedX = x;
    checkedZ = z;
    return true;
  };
};

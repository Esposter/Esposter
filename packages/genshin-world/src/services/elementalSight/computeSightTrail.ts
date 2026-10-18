import type { GroundPoint } from "genshin-engine";
import type { Vector3Like } from "three";

import { computeGroundRun } from "#src/services/elementalSight/computeGroundRun";
import { SIGHT_REACH, SIGHT_TRAIL_STEP } from "#src/services/elementalSight/constants";

// The points a sight trail runs through on the ground, one every step from the origin toward the end, and the end last
// The sight's reach cuts a trail short where its end lies past it, and an end where the origin stands draws no trail
export const computeSightTrail = (
  origin: GroundPoint,
  end: GroundPoint,
  getGroundHeight: (x: number, z: number) => number,
): Vector3Like[] => {
  const { distance } = computeGroundRun(origin, end);
  if (distance === 0) return [];
  const trailLength = Math.min(distance, SIGHT_REACH);
  const stepCount = Math.ceil(trailLength / SIGHT_TRAIL_STEP);
  return Array.from({ length: stepCount + 1 }, (_value, index) => {
    const along = Math.min(index * SIGHT_TRAIL_STEP, trailLength);
    const fraction = along / distance;
    const x = origin.x + (end.x - origin.x) * fraction;
    const z = origin.z + (end.z - origin.z) * fraction;
    return { x, y: getGroundHeight(x, z), z };
  });
};

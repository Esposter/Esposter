import type { GroundPoint } from "genshin-engine";

import { SIGHT_REACH, SIGHT_TRAIL_STEP } from "#src/services/elementalSight/constants";
import { computeGroundDistance } from "genshin-engine";

// Writes the points a sight trail runs through on the ground into `points` as x, y and z triples: one every step from the
// Origin toward the end, and the end last. Returns how many points it wrote. The sight's reach cuts a trail short where its
// End lies past it, and an end where the origin stands writes none
export const computeSightTrail = (
  origin: GroundPoint,
  end: GroundPoint,
  getGroundHeight: (x: number, z: number) => number,
  points: Float32Array,
): number => {
  const distance = computeGroundDistance(end, origin);
  if (distance === 0) return 0;
  const trailLength = Math.min(distance, SIGHT_REACH);
  const pointCount = Math.ceil(trailLength / SIGHT_TRAIL_STEP) + 1;
  for (let index = 0; index < pointCount; index++) {
    const along = Math.min(index * SIGHT_TRAIL_STEP, trailLength);
    const fraction = along / distance;
    const x = origin.x + (end.x - origin.x) * fraction;
    const z = origin.z + (end.z - origin.z) * fraction;
    points[index * 3] = x;
    points[index * 3 + 1] = getGroundHeight(x, z);
    points[index * 3 + 2] = z;
  }
  return pointCount;
};

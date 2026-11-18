import type { GroundRun } from "#src/models/sight/GroundRun";
import type { GroundPoint } from "genshin-engine";

import { computeGroundDistance } from "genshin-engine";

// The distance from an origin to an end on the ground, and the direction toward the end, which every sight trail runs along
export const computeGroundRun = (origin: GroundPoint, end: GroundPoint): GroundRun => {
  const distance = computeGroundDistance(end, origin);
  if (distance === 0) return { directionX: 0, directionZ: 0, distance };
  return { directionX: (end.x - origin.x) / distance, directionZ: (end.z - origin.z) / distance, distance };
};

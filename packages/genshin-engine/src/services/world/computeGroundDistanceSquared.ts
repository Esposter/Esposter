import type { GroundPoint } from "#src/models/world/GroundPoint";

// The squared distance between two points on the ground, the metres between them squared with no root taken
export const computeGroundDistanceSquared = (point: GroundPoint, other: GroundPoint): number =>
  (point.x - other.x) ** 2 + (point.z - other.z) ** 2;

import type { GroundPoint } from "#src/models/world/GroundPoint";

// The distance between two points on the ground, the metres between them, the root of their squared distance
export const computeGroundDistance = (point: GroundPoint, other: GroundPoint): number =>
  Math.hypot(point.x - other.x, point.z - other.z);

import type { GroundPoint } from "genshin-engine";

// The angle between a body's facing and the bearing of a point from it, from 0 to π, the bearing running as the
// Controller's yaw does: zero along -z, and a point ahead of the body at its facing's yaw
export const computeFacingAngle = (position: GroundPoint, facing: number, point: GroundPoint): number => {
  const bearing = Math.atan2(position.x - point.x, position.z - point.z);
  const difference = Math.abs(bearing - facing) % (2 * Math.PI);
  return Math.min(difference, 2 * Math.PI - difference);
};

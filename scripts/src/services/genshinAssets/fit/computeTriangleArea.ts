import type { Vector } from "#src/models/shared/Vector";

// The area of a triangle from its corners
export const computeTriangleArea = ([ax, ay, az]: Vector, [bx, by, bz]: Vector, [cx, cy, cz]: Vector): number => {
  const [ux, uy, uz] = [bx - ax, by - ay, bz - az];
  const [vx, vy, vz] = [cx - ax, cy - ay, cz - az];
  return Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
};

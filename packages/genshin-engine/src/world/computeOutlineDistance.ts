import type { GroundPoint } from "#src/models/world/GroundPoint";

import { computeOutlineSignedDistance } from "#src/world/computeOutlineSignedDistance";

// How far a point on the ground is from an area's outline, zero inside it. An outline not yet drawn is infinitely far
export const computeOutlineDistance = (outline: readonly GroundPoint[], x: number, z: number): number =>
  Math.max(0, -computeOutlineSignedDistance(outline, x, z));

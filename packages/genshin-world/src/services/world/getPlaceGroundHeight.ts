import type { GroundPoint } from "genshin-engine";

import { computeOutlineDistance } from "genshin-engine";

// The height of the ground under a fitted place, read at its position, or none when no outline the catalogue gives the ground
// Holds it: the place is reported then, never placed on a guessed height
export const getPlaceGroundHeight = (
  position: GroundPoint,
  outlines: readonly (readonly GroundPoint[])[],
  getGroundHeight: (x: number, z: number) => number,
): number | undefined =>
  outlines.some((outline) => computeOutlineDistance(outline, position.x, position.z) === 0)
    ? getGroundHeight(position.x, position.z)
    : undefined;

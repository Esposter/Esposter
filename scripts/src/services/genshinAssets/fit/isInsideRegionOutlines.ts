import type { GroundPoint } from "genshin-engine";

import { computeOutlineDistance } from "genshin-engine";

// Whether a point is on a region's ground: inside one of its catalogue outlines. A region the catalogue gives no outline
// Is fitted over its whole disc, so it has none to hold a point to
export const isInsideRegionOutlines = (outlines: readonly (readonly GroundPoint[])[], x: number, z: number): boolean =>
  outlines.length === 0 || outlines.some((outline) => computeOutlineDistance(outline, x, z) === 0);

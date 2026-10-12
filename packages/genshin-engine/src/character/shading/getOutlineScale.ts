import type { Vector3 } from "three";

import { MINIMUM_OUTLINE_KNOT_SPAN } from "#src/character/shading/constants";

// The outline's width scale at a depth, interpolated across the knot pair its depth falls between: the first pair below
// The middle knot, the second at and past it. A knot pair of unit scales leaves the width as drawn
export const getOutlineScale = (depth: number, knotDepths: Vector3, knotScales: Vector3): number => {
  const isNear = depth < knotDepths.y;
  const near = isNear ? knotDepths.x : knotDepths.y;
  const far = isNear ? knotDepths.y : knotDepths.z;
  const nearScale = isNear ? knotScales.x : knotScales.y;
  const farScale = isNear ? knotScales.y : knotScales.z;
  const t = Math.min(Math.max((depth - near) / Math.max(far - near, MINIMUM_OUTLINE_KNOT_SPAN), 0), 1);
  return t * (farScale - nearScale) + nearScale;
};

import type { Vector } from "#src/models/shared/Vector";

export const getHyab = ([l1, a1, b1]: Vector, [l2, a2, b2]: Vector): number =>
  Math.abs(l1 - l2) + Math.hypot(a1 - a2, b1 - b2);

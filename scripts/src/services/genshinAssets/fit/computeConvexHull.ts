import type { Outline } from "#src/models/genshinAssets/fit/Outline";

import { computeHalfHull } from "#src/services/genshinAssets/fit/computeHalfHull";

// The convex hull of the points, counter-clockwise, by the monotone chain, its collinear points dropped
export const computeConvexHull = (points: readonly Outline[]): Outline[] => {
  if (points.length < 2) return [...points];
  const sorted = points.toSorted(([firstX, firstZ], [secondX, secondZ]) => firstX - secondX || firstZ - secondZ);
  const lower = computeHalfHull(sorted);
  const upper = computeHalfHull(sorted.toReversed());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};

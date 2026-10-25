import type { Outline } from "#src/models/genshinAssets/fit/Outline";

// The convex hull of the points, counter-clockwise, by the monotone chain, its collinear points dropped
export const computeConvexHull = (points: readonly Outline[]): Outline[] => {
  const sorted = points.toSorted(([firstX, firstZ], [secondX, secondZ]) => firstX - secondX || firstZ - secondZ);
  const cross = ([originX, originZ]: Outline, [firstX, firstZ]: Outline, [secondX, secondZ]: Outline): number =>
    (firstX - originX) * (secondZ - originZ) - (firstZ - originZ) * (secondX - originX);
  const half = (ordered: readonly Outline[]): Outline[] => {
    const chain: Outline[] = [];
    for (const point of ordered) {
      while (chain.length >= 2 && cross(chain.at(-2) ?? point, chain.at(-1) ?? point, point) <= 0) chain.pop();
      chain.push(point);
    }
    return chain;
  };
  const lower = half(sorted);
  const upper = half(sorted.toReversed());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};

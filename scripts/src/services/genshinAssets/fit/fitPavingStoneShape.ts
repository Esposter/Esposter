import type { PavingStoneShape } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// The outline is sampled at this many angles about y, each a radius of the stone's convex outline
const PAVING_OUTLINE_COUNT = 24;
// A point of the outline in the horizontal plane, its x and z
type Outline = [number, number];

// The convex hull of the points, counter-clockwise, by the monotone chain, its collinear points dropped
const computeConvexHull = (points: readonly Outline[]): Outline[] => {
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
// How far along a ray from the origin the hull's boundary stands, where the ray crosses an edge from a to b; the
// Origin lies inside the hull, so the ray leaves it at the one crossing ahead of it
const computeRayRadius = (hull: readonly Outline[], angle: number): number => {
  const [directionX, directionZ] = [Math.cos(angle), Math.sin(angle)];
  let radius = 0;
  for (const [index, [startX, startZ]] of hull.entries()) {
    const [endX, endZ] = hull[(index + 1) % hull.length] ?? [startX, startZ];
    const [edgeX, edgeZ] = [endX - startX, endZ - startZ];
    const determinant = edgeX * directionZ - edgeZ * directionX;
    if (Math.abs(determinant) < Number.EPSILON) continue;
    const along = (startZ * edgeX - startX * edgeZ) / determinant;
    const across = (startZ * directionX - startX * directionZ) / determinant;
    if (along >= 0 && across >= 0 && across <= 1) radius = Math.max(radius, along);
  }
  return radius;
};
// A paving stone as its outline's radii about its origin, read where the ray at each angle leaves the convex hull of
// Its vertices, with its top and bottom the highest and lowest of them. Its vertices are in three's axes
export const fitPavingStoneShape = (vertices: readonly (readonly [number, number, number])[]): PavingStoneShape => {
  const hull = computeConvexHull(vertices.map(([x, , z]) => [x, z]));
  const heights = vertices.map(([, y]) => y);
  const radii = Array.from({ length: PAVING_OUTLINE_COUNT }, (_side, side) =>
    roundFitted(computeRayRadius(hull, (2 * Math.PI * side) / PAVING_OUTLINE_COUNT)),
  );
  return { bottom: roundFitted(Math.min(...heights)), radii, top: roundFitted(Math.max(...heights)) };
};

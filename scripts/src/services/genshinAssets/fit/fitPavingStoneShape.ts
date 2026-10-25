import type { PavingStoneShape } from "genshin-engine";

import { computeConvexHull } from "#src/services/genshinAssets/fit/computeConvexHull";
import { computeRayRadius } from "#src/services/genshinAssets/fit/computeRayRadius";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// The outline is sampled at this many angles about y, each a radius of the stone's convex outline
const PAVING_OUTLINE_COUNT = 24;

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

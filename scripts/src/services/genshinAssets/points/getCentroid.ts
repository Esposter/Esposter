import type { GroundPoint } from "genshin-engine";

import { computeMean } from "#src/services/genshinAssets/shared/computeMean";

// The mean of a set of points, each axis averaged on its own
export const getCentroid = (points: readonly GroundPoint[]): GroundPoint => ({
  x: computeMean(points.map(({ x }) => x)),
  z: computeMean(points.map(({ z }) => z)),
});

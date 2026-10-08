import type { GroundPoint } from "genshin-engine";

import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";

// The point whose each axis is the median of the set's, which a few far points cannot pull away from the rest
export const getMedianPoint = (points: readonly GroundPoint[]): GroundPoint => ({
  x: computeMedian(points.map(({ x }) => x)),
  z: computeMedian(points.map(({ z }) => z)),
});

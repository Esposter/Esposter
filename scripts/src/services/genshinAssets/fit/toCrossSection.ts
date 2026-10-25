import type { SkeletonNode } from "#src/models/genshinAssets/fit/SkeletonNode";
import type { Vector } from "#src/models/shared/Vector";

import { toDistance } from "#src/services/genshinAssets/fit/toDistance";

const AXES = [0, 1, 2] as const;

// Points' centroid and their mean distance from it
export const toCrossSection = (points: readonly Vector[]): Pick<SkeletonNode, "centre" | "radius"> => {
  const centre: Vector = [0, 0, 0];
  for (const point of points) for (const axis of AXES) centre[axis] += point[axis] / points.length;
  return { centre, radius: points.reduce((sum, point) => sum + toDistance(point, centre), 0) / points.length };
};

import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";

export const findNearestSample = (
  point: readonly number[],
  samples: readonly MeshSample[],
): { distance: number; nearest?: MeshSample } => {
  const getSquaredDistance = (sample: MeshSample) =>
    (sample.point[0] - (point[0] ?? 0)) ** 2 +
    (sample.point[1] - (point[1] ?? 0)) ** 2 +
    (sample.point[2] - (point[2] ?? 0)) ** 2;
  const nearest = findNearest(samples, getSquaredDistance);
  return { distance: Math.sqrt(nearest ? getSquaredDistance(nearest) : Infinity), nearest };
};

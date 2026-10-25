import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";

export const findNearest = (
  point: readonly number[],
  samples: readonly MeshSample[],
): { distance: number; nearest?: MeshSample } => {
  let nearest: MeshSample | undefined;
  let nearestDistance = Infinity;
  for (const sample of samples) {
    const distance =
      (sample.point[0] - (point[0] ?? 0)) ** 2 +
      (sample.point[1] - (point[1] ?? 0)) ** 2 +
      (sample.point[2] - (point[2] ?? 0)) ** 2;
    if (distance >= nearestDistance) continue;
    nearestDistance = distance;
    nearest = sample;
  }
  return { distance: Math.sqrt(nearestDistance), nearest };
};

import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";

import { findNearest } from "#src/services/genshinAssets/fit/findNearest";

const DEGREES_PER_RADIAN = 180 / Math.PI;

// How far a stand-in's surface lies from the one it stands for, read from samples of each and so from no view: the
// Distance from each sample to the other surface's nearest, both ways and on average, in metres, and the angle between
// Each of the target's normals and the normal of the stand-in's sample nearest it, on average, in degrees
export const computeSurfaceError = (
  targetSamples: readonly MeshSample[],
  standInSamples: readonly MeshSample[],
): { angle: number; distance: number } => {
  let targetDistance = 0;
  let angle = 0;
  for (const { normal, point } of targetSamples) {
    const { distance, nearest } = findNearest(point, standInSamples);
    targetDistance += distance;
    const cosine = nearest
      ? normal[0] * nearest.normal[0] + normal[1] * nearest.normal[1] + normal[2] * nearest.normal[2]
      : 1;
    angle += Math.acos(Math.min(1, Math.max(-1, cosine))) * DEGREES_PER_RADIAN;
  }
  let standInDistance = 0;
  for (const { point } of standInSamples) standInDistance += findNearest(point, targetSamples).distance;
  return {
    angle: angle / targetSamples.length,
    distance: (targetDistance / targetSamples.length + standInDistance / standInSamples.length) / 2,
  };
};

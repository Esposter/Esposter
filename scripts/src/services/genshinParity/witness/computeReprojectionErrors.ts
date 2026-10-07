import type { Pixel } from "#src/models/genshinParity/witness/Pixel";
import type { Vector } from "#src/models/shared/Vector";

import { projectWitnessPoint } from "#src/services/genshinParity/witness/projectWitnessPoint";

// How far each correspondence projects from its pixel at a pose, across and down: an edge's correspondence, a point
// On a part's silhouette, is pinned across and free along the silhouette, so only its distance across counts
export const computeReprojectionErrors = (
  pose: readonly number[],
  correspondences: readonly { isEdge?: boolean; pixel: Pixel; point: Readonly<Vector> }[],
  width: number,
  height: number,
): [number, number][] =>
  correspondences.map(({ isEdge, pixel, point }) => {
    const {
      pixel: [u, v],
    } = projectWitnessPoint(pose, point, width, height);
    return [u - pixel[0], isEdge ? 0 : v - pixel[1]];
  });

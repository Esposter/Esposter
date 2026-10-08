import type { SimilarityPair } from "#src/models/genshinAssets/points/SimilarityPair";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";

// The pairs a transform makes between two sets: each point of the first carried over and matched to its nearest point
// Of the second, kept only within the threshold, and where that point's own nearest carried point is this one, so no
// Point of the second is matched twice
export const matchPairs = (
  from: readonly GroundPoint[],
  to: readonly GroundPoint[],
  transform: SimilarityTransform,
  threshold: number,
): SimilarityPair[] => {
  const claims = new Map<number, SimilarityPair>();
  for (const [fromIndex, point] of from.entries()) {
    const carried = applySimilarityTransform(transform, point);
    let nearest: SimilarityPair | undefined;
    for (const [toIndex, target] of to.entries()) {
      const distance = Math.hypot(target.x - carried.x, target.z - carried.z);
      if (!nearest || distance < nearest.distance) nearest = { distance, from: point, fromIndex, to: target, toIndex };
    }
    if (!nearest || nearest.distance >= threshold) continue;
    const claim = claims.get(nearest.toIndex);
    if (!claim || nearest.distance < claim.distance) claims.set(nearest.toIndex, nearest);
  }
  return [...claims.values()];
};

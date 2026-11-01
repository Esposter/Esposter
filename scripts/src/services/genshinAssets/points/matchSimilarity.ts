import type { SimilarityFit } from "#src/models/genshinAssets/points/SimilarityFit";
import type { GroundPoint } from "genshin-engine";

import { checkIsBetterFit } from "#src/services/genshinAssets/points/checkIsBetterFit";
import { INTERACTIVE_MAP_MATCH_TURNS } from "#src/services/genshinAssets/points/constants";
import { createStartTransform } from "#src/services/genshinAssets/points/createStartTransform";
import { refineSimilarity } from "#src/services/genshinAssets/points/refineSimilarity";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The similarity that carries the most of one set onto the other, found by matching from every start turn, mirrored and
// As drawn, and refining each. A pair is a point of the first set matched to a point of the second that the transform
// Carries it near, so the map's statues and waypoints match the scene's without a name to match them by
export const matchSimilarity = (from: readonly GroundPoint[], to: readonly GroundPoint[]): SimilarityFit => {
  let best: SimilarityFit | undefined;
  for (const mirrored of [false, true])
    for (let step = 0; step < INTERACTIVE_MAP_MATCH_TURNS; step++) {
      const turn = (2 * Math.PI * step) / INTERACTIVE_MAP_MATCH_TURNS;
      const fit = refineSimilarity(from, to, createStartTransform(from, to, mirrored, turn));
      if (fit && (!best || checkIsBetterFit(fit, best))) best = fit;
    }
  if (!best) throw new InvalidOperationError(Operation.Read, "similarity", "matches fewer than two pairs");
  return best;
};

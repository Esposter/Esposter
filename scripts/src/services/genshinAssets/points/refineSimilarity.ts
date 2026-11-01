import type { SimilarityFit } from "#src/models/genshinAssets/points/SimilarityFit";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

import { computeResidual } from "#src/services/genshinAssets/points/computeResidual";
import {
  INTERACTIVE_MAP_FIT_BAR,
  INTERACTIVE_MAP_MATCH_INITIAL_DISTANCE,
  INTERACTIVE_MAP_MATCH_ITERATIONS,
  INTERACTIVE_MAP_MATCH_RESIDUAL_MULTIPLE,
} from "#src/services/genshinAssets/points/constants";
import { matchPairs } from "#src/services/genshinAssets/points/matchPairs";
import { solveSimilarity } from "#src/services/genshinAssets/points/solveSimilarity";

// Matches and solves from a start until its pairs settle, each pass matching within the last residual's multiple and
// Never closer than the bar. Yields nothing where a start matches fewer than two pairs, which no turn can be solved from
export const refineSimilarity = (
  from: readonly GroundPoint[],
  to: readonly GroundPoint[],
  start: SimilarityTransform,
): SimilarityFit | undefined => {
  let transform = start;
  let threshold = INTERACTIVE_MAP_MATCH_INITIAL_DISTANCE;
  for (let iteration = 0; iteration < INTERACTIVE_MAP_MATCH_ITERATIONS; iteration++) {
    const pairs = matchPairs(from, to, transform, threshold);
    if (pairs.length < 2) return undefined;
    transform = solveSimilarity(pairs, start.mirrored);
    threshold = Math.max(INTERACTIVE_MAP_FIT_BAR, INTERACTIVE_MAP_MATCH_RESIDUAL_MULTIPLE * computeResidual(pairs));
  }
  const pairs = matchPairs(from, to, transform, threshold);
  if (pairs.length < 2) return undefined;
  return { pairs, residual: computeResidual(pairs), transform };
};

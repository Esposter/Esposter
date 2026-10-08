import type { SimilarityFit } from "#src/models/genshinAssets/points/SimilarityFit";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { computeResidual } from "#src/services/genshinAssets/points/computeResidual";
import {
  INTERACTIVE_MAP_FIT_BAR,
  INTERACTIVE_MAP_MATCH_INITIAL_DISTANCE,
  INTERACTIVE_MAP_MATCH_ITERATIONS,
  INTERACTIVE_MAP_MATCH_RESIDUAL_MULTIPLE,
  INTERACTIVE_MAP_MATCH_START_SCALE,
  INTERACTIVE_MAP_MATCH_TURNS,
} from "#src/services/genshinAssets/points/constants";
import { getMedianPoint } from "#src/services/genshinAssets/points/getMedianPoint";
import { matchPairs } from "#src/services/genshinAssets/points/matchPairs";
import { solveSimilarity } from "#src/services/genshinAssets/points/solveSimilarity";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A start turned as given, at the map's own unit, carrying the first set's median point onto the second's. The medians
// Are the points a few far-off ones of either set cannot pull, which a mean is
const createStartTransform = (
  from: readonly GroundPoint[],
  to: readonly GroundPoint[],
  mirrored: boolean,
  turn: number,
): SimilarityTransform => {
  const base: SimilarityTransform = {
    mirrored,
    offset: { x: 0, z: 0 },
    scale: INTERACTIVE_MAP_MATCH_START_SCALE,
    turn,
  };
  const carried = applySimilarityTransform(base, getMedianPoint(from));
  const targetMedian = getMedianPoint(to);
  return { ...base, offset: { x: targetMedian.x - carried.x, z: targetMedian.z - carried.z } };
};
// Matches and solves from a start until its pairs settle, each pass matching within the last residual's multiple and
// Never closer than the bar. Yields nothing where a start matches fewer than two pairs, which no turn can be solved from
const refineSimilarity = (
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
// The fit matching more pairs, or as many with the smaller residual
const checkIsBetterFit = (fit: SimilarityFit, best: SimilarityFit): boolean =>
  fit.pairs.length === best.pairs.length ? fit.residual < best.residual : fit.pairs.length > best.pairs.length;

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

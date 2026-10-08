import type { SimilarityPair } from "#src/models/genshinAssets/points/SimilarityPair";

// The root-mean-square distance of a set of pairs, the residual a fit is judged by, or zero for none
export const computeResidual = (pairs: readonly SimilarityPair[]): number =>
  Math.sqrt(pairs.reduce((sum, { distance }) => sum + distance ** 2, 0) / Math.max(pairs.length, 1));

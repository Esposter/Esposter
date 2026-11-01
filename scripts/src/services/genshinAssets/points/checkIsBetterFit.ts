import type { SimilarityFit } from "#src/models/genshinAssets/points/SimilarityFit";

// The fit matching more pairs, or as many with the smaller residual
export const checkIsBetterFit = (fit: SimilarityFit, best: SimilarityFit): boolean =>
  fit.pairs.length === best.pairs.length ? fit.residual < best.residual : fit.pairs.length > best.pairs.length;

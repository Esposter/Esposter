import type { SimilarityPair } from "#src/models/genshinAssets/points/SimilarityPair";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

// A similarity solved on the pairs it matches, with the root-mean-square of their distances as its residual
export interface SimilarityFit {
  pairs: SimilarityPair[];
  residual: number;
  transform: SimilarityTransform;
}

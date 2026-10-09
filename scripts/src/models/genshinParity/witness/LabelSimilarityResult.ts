import type { SimilarityTermMap } from "#src/models/genshinParity/witness/SimilarityTermMap";

// Each label's similarity and the scales its structure is read at, with each scale's term map
export interface LabelSimilarityResult {
  labelSimilarities: { scales: number[]; similarity: number }[];
  termMaps: SimilarityTermMap[];
}

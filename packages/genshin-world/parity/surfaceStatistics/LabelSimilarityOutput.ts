// Each label's similarity and the scales its structure is read at, finest first, and each scale's term map: the
// Structure term of every pixel, NaN where no label reaches it
export interface LabelSimilarityOutput {
  labelSimilarities: { scales: number[]; similarity: number }[];
  termMaps: { height: number; terms: Float32Array; width: number }[];
}

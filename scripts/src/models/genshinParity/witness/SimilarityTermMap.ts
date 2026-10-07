// One scale of a structural similarity's terms, each pixel of the scale's size the term of the labels reading it,
// Weighted by their shares of it, and NaN where no label reads it
export interface SimilarityTermMap {
  height: number;
  terms: Float32Array;
  width: number;
}

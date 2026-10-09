// Two grey images of one size and the label of each pixel, -1 where no label reads, as `computeLabelSimilarity` takes them
export interface LabelSimilarityInput {
  height: number;
  labelCount: number;
  labels: Int32Array;
  reference: Float32Array;
  shot: Float32Array;
  width: number;
}

// A pair of grey images and the label of each pixel, as the host hands them over: the labels are the family index as a
// Float, -1 for a pixel no label reads, and each image's luminance in [0, 1]
export interface LabelSimilarityInput {
  height: number;
  labelCount: number;
  labels: Float32Array;
  reference: Float32Array;
  shot: Float32Array;
  width: number;
}

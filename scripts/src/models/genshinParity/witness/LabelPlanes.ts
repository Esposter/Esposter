// A label's share of each pixel and each image weighted by it, so a window reads only the label's own pixels and a
// Neighbour's differences never score against it
export interface LabelPlanes {
  coverage: Float32Array;
  first: Float32Array;
  height: number;
  second: Float32Array;
  width: number;
}

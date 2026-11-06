// What a compute page's area is, read off its row in the compute README's Phases table: a screen, a region, a scene, a
// set of interface pieces without a screen, or a dataset
export enum ComputeKind {
  Screen = "Screen",
  Region = "Region",
  Scene = "Scene",
  Pieces = "Pieces",
  Dataset = "Dataset",
}

export const ComputeKinds = Object.values(ComputeKind);

// What a compute page's area is, read off its row in the compute README's Phases table: a screen, a region, a scene, a
// Set of interface pieces without a screen, or a dataset
export enum ComputeKind {
  Dataset = "Dataset",
  Pieces = "Pieces",
  Region = "Region",
  Scene = "Scene",
  Screen = "Screen",
}

// The kinds in the order the report lists them, and a bad kind's error names them
export const ComputeKinds: readonly ComputeKind[] = [
  ComputeKind.Screen,
  ComputeKind.Region,
  ComputeKind.Scene,
  ComputeKind.Pieces,
  ComputeKind.Dataset,
];

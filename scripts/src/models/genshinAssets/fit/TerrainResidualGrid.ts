// What a ground's hills leave over a region, sampled every step metres on a square grid from its origin in the world's
// Axes, row by row, NaN where the ground is not sampled
export interface TerrainResidualGrid {
  originX: number;
  originZ: number;
  size: number;
  step: number;
  values: Float64Array;
}

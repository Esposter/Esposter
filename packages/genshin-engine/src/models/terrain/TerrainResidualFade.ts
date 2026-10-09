import type { TerrainResidualClearing } from "#src/models/terrain/TerrainResidualClearing";

// Where a residual is drawn and how much of it: a grid of weights from none to one, read bilinearly at a point, each
// Scaling the residual's height there, and none of it outside the grid or inside its clearing. Its first node in x and
// Z, the distance between nodes in metres, its node counts along x and z, and the weights flat in rows along z
export interface TerrainResidualFade {
  cellSize: number;
  clearing?: TerrainResidualClearing;
  origin: readonly number[];
  size: readonly number[];
  weights: readonly number[];
}

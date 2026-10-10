import type { TerrainResidualClearing } from "#src/models/terrain/TerrainResidualClearing";

// Where a residual is drawn and how much of it: a grid of weights from none to one, read bilinearly at a point, each
// Scaling the residual's height there, and none of it outside the grid or inside any of its clearings. Its first node in
// X and z, the distance between nodes in metres, its node counts along x and z, and the weights flat in rows along z
export interface TerrainResidualFade {
  cellSize: number;
  clearings: readonly TerrainResidualClearing[];
  origin: readonly number[];
  size: readonly number[];
  weights: readonly number[];
}

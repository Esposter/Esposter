// How much of a residual each place draws: a grid of weights from none to one, read bilinearly at a point, each scaling
// The residual's height there. Its first node in x and z, the distance between nodes in metres, its node counts along x
// And z, and the weights flat in rows along z. A point outside the grid draws the whole residual
export interface TerrainResidualFade {
  cellSize: number;
  origin: readonly number[];
  size: readonly number[];
  weights: readonly number[];
}

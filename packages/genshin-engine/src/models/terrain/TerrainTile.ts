// One tile's vertices as flat typed arrays, ready to hand from a worker without a copy. Positions are relative to
// The tile's corner. Each vertex's coarse position is where it lies on the next level's grid, the vertex it
// Collapses onto, with the tile's level in its fourth component; the shader morphs toward it by distance
export interface TerrainTile {
  coarsePositions: Float32Array;
  colors: Float32Array;
  key: number;
  normals: Float32Array;
  positions: Float32Array;
}

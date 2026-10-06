// A terrain tile's heightfield as its TerrainData holds it: the samples a side, row by row along z with x within a
// Row, each in metres above the tile's foot, and the metres between two samples
export interface TerrainHeights {
  heights: Float32Array;
  resolution: number;
  spacing: number;
}

import type { TerrainSplatLayer } from "#src/models/genshinAssets/world/TerrainSplatLayer";

// A terrain tile's splat database as its TerrainData holds it: its layers, and the layer each cell of the tile is
// Painted in, as an index into them, the cells a side, row by row along z with x within a row
export interface TerrainSplat {
  cells: Uint8Array;
  layers: TerrainSplatLayer[];
  resolution: number;
}

// The quadtree's shape: every tile is the same grid of cells, a level's tiles are twice the side of the level below,
// And a level is drawn out to twice the distance of the level below
export interface TerrainOptions {
  // Cells along a tile's side, a power of two, so every other vertex lies on the next level's grid
  cellsPerSide: number;
  // How far from the eye the finest level is drawn, in metres
  finestRange: number;
  // The finest tile's side, in metres
  finestTileSize: number;
  levelCount: number;
  // The ground's height range, which bounds every tile for distance and frustum tests
  maxHeight: number;
  minHeight: number;
  // The share of a level's range, at its far end, over which its vertices morph onto the next level's grid
  morphShare: number;
}

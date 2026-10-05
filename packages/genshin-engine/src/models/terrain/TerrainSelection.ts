// Tile keys chosen for a frame, written into a buffer reused every frame: the first `count` are this frame's
export interface TerrainSelection {
  count: number;
  keys: Float64Array;
}

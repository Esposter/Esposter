export interface TileStreamerOptions<TTile> {
  disposeTile: (tile: TTile) => void;
  // How many tiles are held before the least recently wanted is freed
  maxCachedCount: number;
  // How many tiles may be generating at once, so a jump across the world does not queue a view's worth of work
  maxPendingCount: number;
  // Starts generating a tile, which comes back through the streamer's `receive`
  requestTile: (key: number) => void;
}

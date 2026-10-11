import type { TMXChunkParsed } from "#src/models/tmx/parsed/TMXChunkParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";

// The tile data a layer or chunk takes once it is decoded, which needs the async decompression the sax pass cannot
// Wait for. A layer's data holds one cell per tile of its map, a chunk's holds its own size.
export interface TMXPendingTileData {
  expectedCount?: number;
  owner: TMXChunkParsed | TMXLayerParsed;
  source: TMXDataSource;
}

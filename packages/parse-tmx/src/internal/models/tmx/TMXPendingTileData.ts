import type { TMXDataSource } from "#src/internal/models/tmx/TMXDataSource";
import type { TMXChunkParsed } from "#src/models/tmx/parsed/TMXChunkParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

// The tile data a layer or chunk takes once it is decoded.
// Decoding needs the async decompression, which the synchronous XML pass cannot wait for.
// A layer's data holds one cell per tile of its map, a chunk's holds its own size.
export interface TMXPendingTileData {
  expectedCount: number;
  owner: TMXChunkParsed | TMXLayerParsed;
  source: TMXDataSource;
}

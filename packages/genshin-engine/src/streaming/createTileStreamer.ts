import type { TileStreamer } from "#src/streaming/TileStreamer";
import type { TileStreamerOptions } from "#src/streaming/TileStreamerOptions";
import type { TerrainSelection } from "#src/terrain/TerrainSelection";

import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";

interface CachedTile<TTile> {
  lastWantedFrame: number;
  tile: TTile;
}
// Which tiles are held, which are generating, and which to ask for next. The coarsest missing tiles are asked for
// First, since one of them covers the ground a finer tile will later refine, and at most a few generate at once.
// Past the cache's size, the tile wanted longest ago is freed, never one wanted or drawn this frame, and a tile
// Arrives as recently wanted as the last frame that wanted it, so one the view moved on from is freed first. The
// Generating itself is the caller's, through `requestTile` and `receive`, so the streamer runs the same in a test as
// Over a worker pool
export const createTileStreamer = <TTile>({
  disposeTile,
  maxCachedCount,
  maxPendingCount,
  requestTile,
}: TileStreamerOptions<TTile>): TileStreamer<TTile> => {
  const cachedTileMap = new Map<number, CachedTile<TTile>>();
  // Each generating tile's key, to the last frame that wanted it
  const pendingWantedFrameMap = new Map<number, number>();
  let frame = 0;
  let isDisposed = false;

  const evictStale = () => {
    while (cachedTileMap.size > maxCachedCount) {
      let staleKey: number | undefined;
      let staleFrame = frame;
      for (const [key, { lastWantedFrame }] of cachedTileMap)
        if (lastWantedFrame < staleFrame) {
          staleKey = key;
          staleFrame = lastWantedFrame;
        }
      if (staleKey === undefined) return;
      const staleTile = cachedTileMap.get(staleKey);
      cachedTileMap.delete(staleKey);
      if (staleTile) disposeTile(staleTile.tile);
    }
  };

  return {
    dispose: () => {
      isDisposed = true;
      for (const { tile } of cachedTileMap.values()) disposeTile(tile);
      cachedTileMap.clear();
      pendingWantedFrameMap.clear();
    },
    get: (key) => cachedTileMap.get(key)?.tile,
    has: (key) => cachedTileMap.has(key),
    receive: (key, tile) => {
      const lastWantedFrame = pendingWantedFrameMap.get(key) ?? frame;
      pendingWantedFrameMap.delete(key);
      if (isDisposed) {
        disposeTile(tile);
        return;
      }
      cachedTileMap.set(key, { lastWantedFrame, tile });
      evictStale();
    },
    update: ({ count, keys }: TerrainSelection, drawn: TerrainSelection) => {
      frame++;
      let coarsestLevel = 0;
      for (let index = 0; index < count; index++) {
        const key = keys[index] ?? 0;
        const cachedTile = cachedTileMap.get(key);
        if (cachedTile) cachedTile.lastWantedFrame = frame;
        else {
          if (pendingWantedFrameMap.has(key)) pendingWantedFrameMap.set(key, frame);
          coarsestLevel = Math.max(coarsestLevel, getTerrainTileLevel(key));
        }
      }
      // An ancestor drawn in place of a tile still coming is used as much as a wanted one
      for (let index = 0; index < drawn.count; index++) {
        const cachedTile = cachedTileMap.get(drawn.keys[index] ?? 0);
        if (cachedTile) cachedTile.lastWantedFrame = frame;
      }

      for (let level = coarsestLevel; level >= 0 && pendingWantedFrameMap.size < maxPendingCount; level--)
        for (let index = 0; index < count && pendingWantedFrameMap.size < maxPendingCount; index++) {
          const key = keys[index] ?? 0;
          if (getTerrainTileLevel(key) !== level || cachedTileMap.has(key) || pendingWantedFrameMap.has(key)) continue;
          pendingWantedFrameMap.set(key, frame);
          requestTile(key);
        }
    },
  };
};

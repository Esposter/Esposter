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
// Past the cache's size, the tile wanted longest ago is freed, never one wanted this frame. The generating itself
// Is the caller's, through `requestTile` and `receive`, so the streamer runs the same in a test as over a worker pool
export const createTileStreamer = <TTile>({
  disposeTile,
  maxCachedCount,
  maxPendingCount,
  requestTile,
}: TileStreamerOptions<TTile>): TileStreamer<TTile> => {
  const cachedTileMap = new Map<number, CachedTile<TTile>>();
  const pendingKeys = new Set<number>();
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
      pendingKeys.clear();
    },
    get: (key) => cachedTileMap.get(key)?.tile,
    has: (key) => cachedTileMap.has(key),
    receive: (key, tile) => {
      pendingKeys.delete(key);
      if (isDisposed) {
        disposeTile(tile);
        return;
      }
      cachedTileMap.set(key, { lastWantedFrame: frame, tile });
      evictStale();
    },
    update: ({ count, keys }: TerrainSelection) => {
      frame++;
      let coarsestLevel = 0;
      for (let index = 0; index < count; index++) {
        const key = keys[index] ?? 0;
        const cachedTile = cachedTileMap.get(key);
        if (cachedTile) cachedTile.lastWantedFrame = frame;
        else coarsestLevel = Math.max(coarsestLevel, getTerrainTileLevel(key));
      }

      for (let level = coarsestLevel; level >= 0 && pendingKeys.size < maxPendingCount; level--)
        for (let index = 0; index < count && pendingKeys.size < maxPendingCount; index++) {
          const key = keys[index] ?? 0;
          if (getTerrainTileLevel(key) !== level || cachedTileMap.has(key) || pendingKeys.has(key)) continue;
          pendingKeys.add(key);
          requestTile(key);
        }
    },
  };
};

import type { TileStreamer } from "#src/models/streaming/TileStreamer";
import type { TileStreamerOptions } from "#src/models/streaming/TileStreamerOptions";
import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";

import { MAX_TILE_ATTEMPTS } from "#src/streaming/constants";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";

interface CachedTile<TTile> {
  // Whether the tile was built before the last refresh, so it is drawn until its replacement arrives
  isStale: boolean;
  lastWantedFrame: number;
  tile: TTile;
}
// Which tiles are held, which are generating, and which to ask for next. The coarsest missing tiles are asked for
// First, since one of them covers the ground a finer tile will later refine, and at most a few generate at once.
// Past the cache's size, the tile wanted longest ago is freed, never one wanted or drawn this frame, and a tile
// Arrives as recently wanted as the last frame that wanted it, so one the view moved on from is freed first. The
// Generating itself is the caller's, through `requestTile` and `receive`, so the streamer runs the same in a test as
// Over a worker pool. A refresh marks each tile held or generating that it names stale, so each is asked for again as if
// Missing while the held one is still drawn
export const createTileStreamer = <TTile>({
  disposeTile,
  maxCachedCount,
  maxPendingCount,
  requestTile,
}: TileStreamerOptions<TTile>): TileStreamer<TTile> => {
  const cachedTileMap = new Map<number, CachedTile<TTile>>();
  // Each generating tile's key, to the last frame that wanted it
  const pendingWantedFrameMap = new Map<number, number>();
  // Each key's failures so far, and the keys given up for the session once they reach MAX_TILE_ATTEMPTS
  const failedAttemptMap = new Map<number, number>();
  const givenUpKeySet = new Set<number>();
  // The keys generating when the last refresh came, whose tiles arrive built over what it replaced
  const stalePendingKeySet = new Set<number>();
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

  const checkIsSettled = (key: number): boolean => {
    const cachedTile = cachedTileMap.get(key);
    return (cachedTile !== undefined && !cachedTile.isStale) || givenUpKeySet.has(key);
  };

  return {
    dispose: () => {
      isDisposed = true;
      for (const { tile } of cachedTileMap.values()) disposeTile(tile);
      cachedTileMap.clear();
      pendingWantedFrameMap.clear();
      failedAttemptMap.clear();
      givenUpKeySet.clear();
      stalePendingKeySet.clear();
    },
    fail: (key) => {
      pendingWantedFrameMap.delete(key);
      stalePendingKeySet.delete(key);
      const attempts = (failedAttemptMap.get(key) ?? 0) + 1;
      failedAttemptMap.set(key, attempts);
      if (attempts < MAX_TILE_ATTEMPTS) return false;
      givenUpKeySet.add(key);
      return true;
    },
    get: (key) => cachedTileMap.get(key)?.tile,
    has: (key) => cachedTileMap.has(key),
    isSettled: checkIsSettled,
    receive: (key, tile) => {
      const lastWantedFrame = pendingWantedFrameMap.get(key) ?? frame;
      pendingWantedFrameMap.delete(key);
      const isStale = stalePendingKeySet.delete(key);
      if (isDisposed) {
        disposeTile(tile);
        return;
      }
      const replacedTile = cachedTileMap.get(key);
      cachedTileMap.set(key, { isStale, lastWantedFrame, tile });
      if (replacedTile && replacedTile.tile !== tile) disposeTile(replacedTile.tile);
      evictStale();
    },
    refresh: (checkIsChanged) => {
      for (const [key, cachedTile] of cachedTileMap) if (checkIsChanged(key)) cachedTile.isStale = true;
      for (const key of pendingWantedFrameMap.keys()) if (checkIsChanged(key)) stalePendingKeySet.add(key);
    },
    update: (wanted: TerrainSelection, drawn: TerrainSelection, surrounding: TerrainSelection) => {
      frame++;
      // An ancestor drawn in place of a tile still coming is used as much as a wanted one
      for (const { count, keys } of [wanted, drawn, surrounding])
        for (let index = 0; index < count; index++) {
          const key = keys[index] ?? 0;
          const cachedTile = cachedTileMap.get(key);
          if (cachedTile) cachedTile.lastWantedFrame = frame;
          else if (pendingWantedFrameMap.has(key)) pendingWantedFrameMap.set(key, frame);
        }
      // Every tile the view wants is asked for before any of those round it, so turning finds the ground held without
      // Slowing the view's own
      for (const { count, keys } of [wanted, surrounding]) {
        let coarsestLevel = 0;
        for (let index = 0; index < count; index++) {
          const key = keys[index] ?? 0;
          if (!checkIsSettled(key)) coarsestLevel = Math.max(coarsestLevel, getTerrainTileLevel(key));
        }
        for (let level = coarsestLevel; level >= 0 && pendingWantedFrameMap.size < maxPendingCount; level--)
          for (let index = 0; index < count && pendingWantedFrameMap.size < maxPendingCount; index++) {
            const key = keys[index] ?? 0;
            if (getTerrainTileLevel(key) !== level || checkIsSettled(key) || pendingWantedFrameMap.has(key)) continue;
            pendingWantedFrameMap.set(key, frame);
            requestTile(key);
          }
      }
    },
  };
};

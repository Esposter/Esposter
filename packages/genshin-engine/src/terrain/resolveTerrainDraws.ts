import type { TerrainOptions } from "#src/terrain/TerrainOptions";
import type { TerrainSelection } from "#src/terrain/TerrainSelection";

import { getParentTerrainTileKey } from "#src/terrain/getParentTerrainTileKey";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";

// Reused every frame, so resolving allocates nothing once it has grown to the view's tiles
const fallbackKeys = new Set<number>();

const checkFallbackAncestor = (key: number, levelCount: number): boolean => {
  // Once every wanted tile has arrived there is nothing to walk up to, which is the frame almost always
  if (fallbackKeys.size === 0) return false;
  let ancestorKey = key;
  for (let level = getTerrainTileLevel(key) + 1; level < levelCount; level++) {
    ancestorKey = getParentTerrainTileKey(ancestorKey);
    if (fallbackKeys.has(ancestorKey)) return true;
  }
  return false;
};
// The tiles to draw this frame: each wanted tile that has arrived, and in place of one still being generated, its
// Nearest ancestor that has. A tile inside an ancestor drawn in its place is dropped, so the ground is covered once,
// Coarser for the moment where it is still streaming in. Written into the draws, so a frame allocates nothing
export const resolveTerrainDraws = (
  { levelCount }: Pick<TerrainOptions, "levelCount">,
  wanted: TerrainSelection,
  checkTileLoaded: (key: number) => boolean,
  draws: TerrainSelection,
): TerrainSelection => {
  fallbackKeys.clear();
  for (let index = 0; index < wanted.count; index++) {
    let key = wanted.keys[index] ?? 0;
    if (checkTileLoaded(key)) continue;
    for (let level = getTerrainTileLevel(key) + 1; level < levelCount; level++) {
      key = getParentTerrainTileKey(key);
      if (!checkTileLoaded(key)) continue;
      fallbackKeys.add(key);
      break;
    }
  }

  draws.count = 0;
  for (let index = 0; index < wanted.count && draws.count < draws.keys.length; index++) {
    const key = wanted.keys[index] ?? 0;
    if (!checkTileLoaded(key) || checkFallbackAncestor(key, levelCount)) continue;
    draws.keys[draws.count] = key;
    draws.count++;
  }

  for (const key of fallbackKeys) {
    if (draws.count === draws.keys.length || checkFallbackAncestor(key, levelCount)) continue;
    draws.keys[draws.count] = key;
    draws.count++;
  }

  return draws;
};

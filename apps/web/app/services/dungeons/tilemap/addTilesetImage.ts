import type { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { Tilemaps } from "phaser";

import { ignoreWarn } from "@/util/console/ignoreWarn";
import { getOrCreate } from "@esposter/shared";

// A tileset belongs to the tilemap it was added to, so the cache is per tilemap rather than per map key
const tilesetCache = new WeakMap<Tilemaps.Tilemap, Map<TilesetKey, Tilemaps.Tileset>>();

export const addTilesetImage = (tilemap: Tilemaps.Tilemap, tilesetKey: BaseTilesetKey) => {
  const tilesetMap = getOrCreate(tilesetCache, tilemap, () => new Map<TilesetKey, Tilemaps.Tileset>());
  const tileset = tilesetMap.get(tilesetKey);
  if (tileset) return tileset;
  // Phaser warns on tileset keys the tilemap doesn't require, which is harmless because every one of them is
  // Created; the tileset name must exactly match the tileset key
  const newTileset = ignoreWarn(() => tilemap.addTilesetImage(tilesetKey));
  if (newTileset) tilesetMap.set(tilesetKey, newTileset);
  return newTileset;
};

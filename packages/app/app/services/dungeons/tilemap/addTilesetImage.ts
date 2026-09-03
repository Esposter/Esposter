import type { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { Tilemaps } from "phaser";

import { ignoreWarn } from "@/util/console/ignoreWarn";

const tilesetCache = new Map<TilemapKey, Map<TilesetKey, Tilemaps.Tileset>>();
// Only our created base tileset keys are used in all our tilemaps
export const addTilesetImage = (tilemap: Tilemaps.Tilemap, tilemapKey: TilemapKey, tilesetKey: BaseTilesetKey) => {
  const tilesetMap = tilesetCache.get(tilemapKey);
  if (!tilesetMap) {
    const newTileset = baseAddTilesetImage(tilemap, tilesetKey);
    if (newTileset) tilesetCache.set(tilemapKey, new Map([[tilesetKey, newTileset]]));
    return newTileset;
  }

  const tileset = tilesetMap.get(tilesetKey);
  if (!tileset) {
    const newTileset = baseAddTilesetImage(tilemap, tilesetKey);
    if (newTileset) tilesetMap.set(tilesetKey, newTileset);
    return newTileset;
  }
  return tileset;
};

const baseAddTilesetImage = (tilemap: Tilemaps.Tilemap, tilesetKey: TilesetKey) =>
  // Phaser warns on tileset keys the tilemap doesn't require, which is fine since we always create
  // All of them; the tileset name must exactly match the tileset key.
  ignoreWarn(() => tilemap.addTilesetImage(tilesetKey));

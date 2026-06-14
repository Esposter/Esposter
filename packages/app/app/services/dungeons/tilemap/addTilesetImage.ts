import type { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TilesetKey } from "#shared/models/dungeons/keys/TilesetKey";
import type { Tilemaps } from "phaser";

import { ignoreWarn } from "@/util/console/ignoreWarn";

const cache = new Map<TilemapKey, Map<TilesetKey, Tilemaps.Tileset>>();
// Only our created base tileset keys are used in all our tilemaps
export const addTilesetImage = (tilemap: Tilemaps.Tilemap, tilemapKey: TilemapKey, tilesetKey: BaseTilesetKey) => {
  const tilesetMap = cache.get(tilemapKey);
  if (!tilesetMap) {
    const newTileset = baseAddTilesetImage(tilemap, tilesetKey);
    if (newTileset) cache.set(tilemapKey, new Map([[tilesetKey, newTileset]]));
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

const baseAddTilesetImage = (tilemap: Tilemaps.Tilemap, tilesetKey: TilesetKey) => {
  // Phaser warns on tileset keys the tilemap doesn't require, which is fine since we always create
  // All of them; the tileset name must exactly match the tileset key.
  const newTileset = ignoreWarn(() => tilemap.addTilesetImage(tilesetKey));
  if (!newTileset) return null;
  return newTileset;
};

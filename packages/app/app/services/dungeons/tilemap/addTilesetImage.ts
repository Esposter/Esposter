import type { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { Tilemaps } from "phaser";

import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { ignoreWarn } from "@/util/console/ignoreWarn";

const cache = new Map<TilemapKey, Map<TilesetKey, Tilemaps.Tileset>>();
// Only our generated base tileset keys are used in all our tilemaps
export const addTilesetImage = (tilemapKey: TilemapKey, tilesetKey: BaseTilesetKey) => {
  const tilesetMap = cache.get(tilemapKey);
  if (!tilesetMap) {
    const newTileset = baseAddTilesetImage(tilesetKey);
    if (newTileset) cache.set(tilemapKey, new Map([[tilesetKey, newTileset]]));
    return newTileset;
  }

  const tileset = tilesetMap.get(tilesetKey);
  if (!tileset) {
    const newTileset = baseAddTilesetImage(tilesetKey);
    if (newTileset) tilesetMap.set(tilesetKey, newTileset);
    return newTileset;
  }
  return tileset;
};

const baseAddTilesetImage = (tilesetKey: TilesetKey) => {
  // We get warnings from phaser if we try specifying tileset keys that are not required by
  // the tilemap, which is ok because we always try create all the tilesets
  // and store them in the cache for convenience in the development workflow
  // We will also enforce that the tileset name should exactly match the tileset key
  const newTileset = ignoreWarn(() => ExternalWorldSceneStore.tilemap.addTilesetImage(tilesetKey));
  if (!newTileset) return null;
  return newTileset;
};

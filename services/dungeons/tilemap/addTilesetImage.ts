import type { BaseTilesetKey } from "@/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { ignoreWarn } from "@/util/console/ignoreWarn";
import type { Tilemaps } from "phaser";

const cache = new Map<TilesetKey, Tilemaps.Tileset>();
// Only our generated base tileset keys are used in all our tilemaps
export const addTilesetImage = (tilesetKey: BaseTilesetKey) => {
  const tileset = cache.get(tilesetKey);
  if (tileset) return tileset;
  // We get warnings from phaser if we try specifying tileset keys that are not required by
  // the tilemap, which is ok because we always try create all the tilesets
  // and store them in the cache for convenience in the development workflow
  // We will also enforce that the tileset name should exactly match the tileset key
  const newTileset = ignoreWarn(() => ExternalWorldSceneStore.tilemap.addTilesetImage(tilesetKey));
  if (!newTileset) return null;
  cache.set(tilesetKey, newTileset);
  return newTileset;
};

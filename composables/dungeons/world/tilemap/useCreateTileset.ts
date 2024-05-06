import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

const cache = new Map<TilesetKey, Tilemaps.Tileset>();

export const useCreateTileset = (tilesetKey: TilesetKey) => {
  const tileset = cache.get(tilesetKey);
  if (tileset) return tileset;

  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  // We will enforce that the tileset name should exactly match the tileset key
  const newTileset = tilemap.value.addTilesetImage(tilesetKey);
  // This will happen if we try specifying tileset keys that are not required by
  // the tilemap, which is ok because we always try create all the tilesets
  // and store them in the cache for convenience in the development workflow
  if (!newTileset) return null;
  cache.set(tilesetKey, newTileset);
  return newTileset;
};

import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
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
  if (!newTileset) throw new InvalidOperationError(Operation.Create, useCreateTileset.name, `key: ${tilesetKey}`);
  cache.set(tilesetKey, newTileset);
  return newTileset;
};

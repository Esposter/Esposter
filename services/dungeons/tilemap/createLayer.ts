import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { InvalidOperationError } from "esposter-shared/models/error/InvalidOperationError";
import { Operation } from "esposter-shared/models/shared/Operation";
import type { Tilemaps } from "phaser";

export const createLayer = (layerName: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const layer = ExternalWorldSceneStore.tilemap.createLayer(layerName, tileset);
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

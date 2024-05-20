import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { InvalidOperationError, Operation } from "@esposter/shared";
import type { Tilemaps } from "phaser";

export const createLayer = (layerName: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const layer = ExternalWorldSceneStore.tilemap.createLayer(layerName, tileset);
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

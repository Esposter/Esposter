import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const createLayer = (layerName: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const layer = ExternalWorldSceneStore.tilemap.createLayer(layerName, tileset);
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

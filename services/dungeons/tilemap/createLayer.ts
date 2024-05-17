import { Operation } from "@/models/shared/Operation";
import { ExternalWorldScene~/packages/shared/models/shared/Operationgeons/world/scene";
import type { Tilemaps } from "phaser";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

export const createLayer = (layerName: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const layer = ExternalWorldSceneStore.tilemap.createLayer(layerName, tileset);
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

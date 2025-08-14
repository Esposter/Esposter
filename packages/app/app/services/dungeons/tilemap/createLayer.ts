import type { Tilemaps } from "phaser";

import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { InvalidOperationError, Operation } from "@esposter/shared";
// @TODO: Test GPU Layer
export const createLayer = (layerName: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const layer = ExternalWorldSceneStore.tilemap.createLayer(layerName, tileset) as Tilemaps.TilemapLayer | undefined;
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

import type { Tilemaps } from "phaser";

import { InvalidOperationError, Operation } from "@esposter/shared";
// @TODO: Test GPU Layer
export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  layerName: string,
  tileset: Tilemaps.Tileset | Tilemaps.Tileset[],
) => {
  const layer = tilemap.createLayer(layerName, tileset) as Tilemaps.TilemapLayer | undefined;
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

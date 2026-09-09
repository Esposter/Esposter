import type { Tilemaps } from "phaser";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  layerName: string,
  tileset: Tilemaps.Tileset | Tilemaps.Tileset[],
) => {
  // Phaser types this as never-null and possibly a GPU layer, but a layer name the tilemap doesn't carry
  // Returns null at runtime, and this game only ever creates CPU layers
  const layer = tilemap.createLayer(layerName, tileset) as null | Tilemaps.TilemapLayer;
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

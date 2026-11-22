import type { Tilemaps } from "phaser";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  layerName: string,
  tileset: Tilemaps.Tileset | Tilemaps.Tileset[],
) => {
  // Phaser types this as a CPU layer or a GPU layer, but a layer name the tilemap doesn't carry returns null at runtime,
  // And this game only ever creates CPU layers, so the one type it can return besides null is the one this names
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Phaser's createLayer return type is a union with the GPU layer this game never creates, and it omits the null it returns for a missing layer
  const layer = tilemap.createLayer(layerName, tileset) as null | Tilemaps.TilemapLayer;
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

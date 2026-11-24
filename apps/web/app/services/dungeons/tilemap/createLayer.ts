import type { Tilemaps } from "phaser";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  layerName: string,
  tileset: Tilemaps.Tileset | Tilemaps.Tileset[],
) => {
  // Phaser types this as a CPU or a GPU layer, but a name the tilemap does not carry returns null at runtime.
  // This game only ever creates CPU layers, so the one type it can return besides null is the CPU layer.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the type omits the null a missing layer returns
  const layer = tilemap.createLayer(layerName, tileset) as null | Tilemaps.TilemapLayer;
  if (!layer) throw new InvalidOperationError(Operation.Create, createLayer.name, `id: ${layerName}`);
  return layer;
};

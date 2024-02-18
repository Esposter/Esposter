import { type Tilemaps } from "phaser";

export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  layerId: string,
  tileset: Tilemaps.Tileset | Tilemaps.Tileset[],
) => {
  const layer = tilemap.createLayer(layerId, tileset);
  if (!layer) throw new Error(`Could not create tilemap layer, layer id: ${layerId}`);
  return layer;
};

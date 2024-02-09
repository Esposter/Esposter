import { type Tilemaps } from "phaser";

export const createLayer = (tilemap: Tilemaps.Tilemap, layerId: string, tilesetKey: string) => {
  // We will enforce that the tileset name should exactly match the tileset key
  const tilesetImage = tilemap.addTilesetImage(tilesetKey);
  if (!tilesetImage) throw new Error(`Could not create tileset image, key: ${tilesetKey}`);

  const layer = tilemap.createLayer(layerId, tilesetImage);
  if (!layer) throw new Error(`Could not create tilemap layer, layer id: ${layerId}, key: ${tilesetKey}`);
  return layer;
};

import { type Tilemaps } from "phaser";

export const createLayer = (tilemap: Tilemaps.Tilemap, layerId: string, tilesetName: string, tilesetKey: string) => {
  const tilesetImage = tilemap.addTilesetImage(tilesetName, tilesetKey);
  if (!tilesetImage) throw new Error(`Could not create tileset image, name: ${tilesetName}, key: ${tilesetKey}`);

  const layer = tilemap.createLayer(layerId, tilesetImage);
  if (!layer)
    throw new Error(`Could not create tilemap layer, layer id: ${layerId}, name: ${tilesetName}, key: ${tilesetKey}`);
  return layer;
};

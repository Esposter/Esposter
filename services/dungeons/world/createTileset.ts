import { type Tilemaps } from "phaser";

export const createTileset = (tilemap: Tilemaps.Tilemap, tilesetKey: string) => {
  // We will enforce that the tileset name should exactly match the tileset key
  const tileset = tilemap.addTilesetImage(tilesetKey);
  if (!tileset) throw new Error(`Could not create tileset image, key: ${tilesetKey}`);
  return tileset;
};

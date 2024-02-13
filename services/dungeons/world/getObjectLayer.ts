import { type ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { type Tilemaps } from "phaser";

export const getObjectLayer = (tilemap: Tilemaps.Tilemap, objectLayer: ObjectLayer) => {
  const layer = tilemap.getObjectLayer(objectLayer);
  if (!layer) throw new Error(`Could not get object layer, name: ${objectLayer}`);
  return layer;
};

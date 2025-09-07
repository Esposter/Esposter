import type { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import type { Tilemaps } from "phaser";

export const getObjectLayer = (tilemap: Tilemaps.Tilemap, layerName: ObjectgroupName) =>
  tilemap.getObjectLayer(layerName);

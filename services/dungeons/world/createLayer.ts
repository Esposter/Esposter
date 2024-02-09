import { type TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { type TilesetName } from "@/models/dungeons/keys/TilesetName";
import { toTitleCase } from "@/util/text/toTitleCase";
import { type Tilemaps } from "phaser";

export const createLayer = (
  tilemap: Tilemaps.Tilemap,
  tilesetName: TilesetName[keyof TilesetName],
  tilesetKey: TilesetKey,
) => {
  const tilesetImage = tilemap.addTilesetImage(tilesetName, tilesetKey);
  if (!tilesetImage) throw new Error(`Could not create tileset image, name: ${tilesetName}, key: ${tilesetKey}`);

  const layerId = toTitleCase(tilesetName);
  const layer = tilemap.createLayer(layerId, tilesetImage);
  if (!layer)
    throw new Error(`Could not create tilemap layer, layer id: ${layerId}, name: ${tilesetName}, key: ${tilesetKey}`);
  return layer;
};

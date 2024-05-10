import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { BaseTilesetKey } from "@/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import type { TilemapMetadataParams } from "@/models/dungeons/tilemap/TilemapMetadataParams";
import { addTilesetImage } from "@/services/dungeons/tilemap/addTilesetImage";
import { DEBUG_TILE_LAYER_ALPHA } from "@/services/dungeons/tilemap/constants";
import { createLayer } from "@/services/dungeons/tilemap/createLayer";
import { getObjectLayer } from "@/services/dungeons/tilemap/getObjectLayer";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const createTilemapMetadata = <TLayerName extends object>(
  layerNameEnum: TLayerName,
  ...args: TilemapMetadataParams
) => {
  const [tilemapKey] = args;

  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets: Tilemaps.Tileset[] = [];
    for (const tilesetKey of Object.values(BaseTilesetKey)) {
      const tileset = addTilesetImage(tilemapKey, tilesetKey);
      if (!tileset) continue;
      tilesets.push(tileset);
    }
    const layer = createLayer(layerName, tilesets);
    const debugLayerNames = [LayerName.Collision, LayerName.Encounter];
    if (debugLayerNames.includes(layerName)) layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
  }

  for (const objectgroupName of Object.values(ObjectgroupName))
    ExternalWorldSceneStore.objectLayerMap[objectgroupName] = getObjectLayer(objectgroupName);
};

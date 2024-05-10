import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { BaseTilesetKey } from "@/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { addTilesetImage } from "@/services/dungeons/tilemap/addTilesetImage";
import { DEBUG_TILE_LAYER_ALPHA } from "@/services/dungeons/tilemap/constants";
import { createLayer } from "@/services/dungeons/tilemap/createLayer";
import { getObjectLayer } from "@/services/dungeons/tilemap/getObjectLayer";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const createTilemapMetadata = <TLayerName extends object>(layerNameEnum: TLayerName) => {
  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets: Tilemaps.Tileset[] = [];
    for (const tilesetKey of Object.values(BaseTilesetKey)) {
      const tileset = addTilesetImage(tilesetKey);
      if (!tileset) continue;
      tilesets.push(tileset);
    }
    const layer = createLayer(layerName, tilesets);
    if (layerName === LayerName.Encounter)
      ExternalWorldSceneStore.encounterLayer = layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
    else if (layerName === LayerName.Collision) layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
  }

  for (const objectgroupName of Object.values(ObjectgroupName))
    ExternalWorldSceneStore.objectLayerMap[objectgroupName] = getObjectLayer(objectgroupName);
};

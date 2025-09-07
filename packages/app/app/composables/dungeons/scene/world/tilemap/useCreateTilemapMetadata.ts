import type { Tilemaps } from "phaser";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { addTilesetImage } from "@/services/dungeons/tilemap/addTilesetImage";
import { DEBUG_TILE_LAYER_ALPHA } from "@/services/dungeons/tilemap/constants";
import { createLayer } from "@/services/dungeons/tilemap/createLayer";
import { getObjectLayer } from "@/services/dungeons/tilemap/getObjectLayer";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTilemapMetadata = (layerNameEnum: Record<string, string>) => {
  const worldSceneStore = useWorldSceneStore();
  const { layerMap, objectLayerMap, tilemap, tilemapKey } = storeToRefs(worldSceneStore);

  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets: Tilemaps.Tileset[] = [];
    for (const tilesetKey of Object.values(BaseTilesetKey)) {
      const tileset = addTilesetImage(tilemap.value, tilemapKey.value, tilesetKey);
      if (!tileset) continue;
      tilesets.push(tileset);
    }
    const layer = createLayer(tilemap.value, layerName, tilesets);
    const debugLayerNames: string[] = [LayerName.Collision, LayerName.Encounter];
    if (debugLayerNames.includes(layerName)) layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);

    if (layerMap.value) layerMap.value.set(layerName, layer);
    else layerMap.value = new Map([[layerName, layer]]);
  }

  if (!objectLayerMap.value) {
    objectLayerMap.value = new Map();

    for (const objectgroupName of Object.values(ObjectgroupName)) {
      const objectLayer = getObjectLayer(tilemap.value, objectgroupName);
      if (!objectLayer) continue;
      objectLayerMap.value.set(objectgroupName, objectLayer);
    }
  }
};

import type { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import type { Tilemaps } from "phaser";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { addTilesetImage } from "@/services/dungeons/tilemap/addTilesetImage";
import { BASE_TILESET_KEYS, OBJECTGROUP_NAMES } from "@/services/dungeons/tilemap/constants";
import { createLayer } from "@/services/dungeons/tilemap/createLayer";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTilemapMetadata = (layerNameEnum: Record<string, string>) => {
  const worldSceneStore = useWorldSceneStore();
  const { layerMap, objectLayerMap, tilemap } = storeToRefs(worldSceneStore);
  // Both maps belong to the tilemap being created, so each is built fresh rather than kept from the tilemap before
  const rawLayerMap = new Map<string, ReturnType<typeof createLayer>>();
  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets: Tilemaps.Tileset[] = [];
    for (const tilesetKey of BASE_TILESET_KEYS) {
      const tileset = addTilesetImage(tilemap.value, tilesetKey);
      if (!tileset) continue;
      tilesets.push(tileset);
    }
    const layer = createLayer(tilemap.value, layerName, tilesets);
    const debugLayerNames: string[] = [LayerName.Collision, LayerName.Encounter];
    if (debugLayerNames.includes(layerName)) layer.setAlpha(IS_PRODUCTION ? 0 : 0.7);
    // A layer holds its scene, so it enters the store raw like the tilemap it belongs to
    rawLayerMap.set(layerName, markRaw(layer));
  }
  layerMap.value = rawLayerMap;

  const newObjectLayerMap = new Map<ObjectgroupName, Tilemaps.ObjectLayer>();
  for (const objectgroupName of OBJECTGROUP_NAMES) {
    const objectLayer = tilemap.value.getObjectLayer(objectgroupName);
    if (!objectLayer) continue;
    newObjectLayerMap.set(objectgroupName, objectLayer);
  }
  objectLayerMap.value = newObjectLayerMap;
};

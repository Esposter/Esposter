import type { Tilemaps } from "phaser";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { Chest } from "#shared/models/dungeons/data/world/Chest";
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { createWorldGridEngine } from "#src/services/dungeons/gridEngine/createWorldGridEngine";
import { getObjects } from "#src/services/dungeons/scene/world/getObjects";
import { TilemapMetadataMap } from "#src/services/dungeons/tilemap/TilemapMetadataMap";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";

export const createTilemapAssets = (newTilemap: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { gridEngine, objectLayerMap, tilemap, tilemapKey, worldData } = storeToRefs(worldSceneStore);

  tilemap.value = markRaw(newTilemap);
  TilemapMetadataMap[tilemapKey.value]();
  const chestObjectLayer = objectLayerMap.value?.get(ObjectgroupName.Chest);
  if (chestObjectLayer) {
    const chestObjects = getObjects(tilemap.value, chestObjectLayer);
    for (const { x, y } of chestObjects) {
      const positionId = getPositionId({ x, y });
      if (positionId in worldData.value.chestMap) continue;
      else worldData.value.chestMap[positionId] = new Chest();
    }
  }

  createWorldGridEngine(tilemap.value).match((newGridEngine) => {
    gridEngine.value = markRaw(newGridEngine);
  }, console.error);
};

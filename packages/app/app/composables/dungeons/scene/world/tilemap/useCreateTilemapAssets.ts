import type { Tilemaps } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { Chest } from "#shared/models/dungeons/data/world/Chest";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getPositionId } from "@/services/dungeons/direction/getPositionId";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { UseCreateTilemapMetadataMap } from "@/services/dungeons/tilemap/UseCreateTilemapMetadataMap";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTilemapAssets = (scene: SceneWithPlugins, newTilemap: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { objectLayerMap, tilemap, tilemapKey, worldData } = storeToRefs(worldSceneStore);

  tilemap.value = newTilemap;
  UseCreateTilemapMetadataMap[tilemapKey.value]();
  const chestObjectLayer = objectLayerMap.value?.get(ObjectgroupName.Chest);
  if (chestObjectLayer) {
    const chestObjects = getObjects(tilemap.value, chestObjectLayer);
    for (const { x, y } of chestObjects) {
      const positionId = getPositionId({ x, y });
      if (positionId in worldData.value.chestMap) continue;
      else worldData.value.chestMap[positionId] = new Chest();
    }
  }

  scene.gridEngine.create(tilemap.value, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

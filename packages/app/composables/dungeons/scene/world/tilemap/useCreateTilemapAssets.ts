import type { Tilemaps } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { Chest } from "@/models/dungeons/data/world/Chest";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getPositionId } from "@/services/dungeons/direction/getPositionId";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { CreateTilemapMetadataMap } from "@/services/dungeons/tilemap/CreateTilemapMetadataMap";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTilemapAssets = (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey, worldData } = storeToRefs(worldSceneStore);

  ExternalWorldSceneStore.tilemap = tilemap;
  CreateTilemapMetadataMap[tilemapKey.value](tilemapKey.value);
  const chestObjectLayer = ExternalWorldSceneStore.objectLayerMap.get(ObjectgroupName.Chest);
  if (chestObjectLayer) {
    const chestObjects = getObjects(chestObjectLayer);
    for (const { x, y } of chestObjects) {
      const positionId = getPositionId({ x, y });
      if (positionId in worldData.value.chestMap) continue;
      else worldData.value.chestMap[positionId] = new Chest();
    }
  }

  scene.gridEngine.create(ExternalWorldSceneStore.tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Tilemaps } from "phaser";

import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { Chest } from "@/models/dungeons/data/world/Chest";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { CreateTilemapMetadataMap } from "@/services/dungeons/tilemap/CreateTilemapMetadataMap";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { getPositionId } from "@/util/id/getPositionId";

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
      if (worldData.value.chestMap[positionId]) continue;
      else worldData.value.chestMap[positionId] = new Chest();
    }
  }

  scene.gridEngine.create(ExternalWorldSceneStore.tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { Chest } from "@/models/dungeons/data/world/Chest";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { CreateTilemapMetadataMap } from "@/services/dungeons/tilemap/CreateTilemapMetadataMap";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemapAssets = (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey, worldData } = storeToRefs(worldSceneStore);

  ExternalWorldSceneStore.tilemap = tilemap;
  CreateTilemapMetadataMap[tilemapKey.value](tilemapKey.value);

  const chestObjectLayer = ExternalWorldSceneStore.objectLayerMap.get(ObjectgroupName.Chest);
  if (chestObjectLayer) {
    const chestObjects = getObjects(chestObjectLayer);
    for (const { x, y } of chestObjects) {
      const chestId = getChestId({ x, y });
      if (worldData.value.chestMap.has(chestId)) continue;
      else worldData.value.chestMap.set(chestId, new Chest());
    }
  }

  scene.gridEngine.create(ExternalWorldSceneStore.tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

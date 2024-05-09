import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { Chest } from "@/models/dungeons/data/world/Chest";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { CreateTilemapMetadataMap } from "@/services/dungeons/tilemap/CreateTilemapMetadataMap";
import { getObjectUnitPosition } from "@/services/dungeons/tilemap/getObjectUnitPosition";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemapAssets = (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey, worldData } = storeToRefs(worldSceneStore);

  ExternalWorldSceneStore.tilemap = tilemap;
  CreateTilemapMetadataMap[tilemapKey.value]();

  for (const { x, y } of ExternalWorldSceneStore.objectLayerMap[ObjectgroupName.Chest]?.objects ?? []) {
    if (!(x && y)) continue;

    const position = getObjectUnitPosition({ x, y });
    const chestId = getChestId(position);
    if (worldData.value.chestMap.has(chestId)) continue;
    else worldData.value.chestMap.set(chestId, new Chest());
  }

  scene.gridEngine.create(tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

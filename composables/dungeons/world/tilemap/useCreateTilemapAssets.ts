import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { Chest } from "@/models/dungeons/data/world/Chest";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { CreateTilemapMetadataMap } from "@/services/dungeons/tilemap/CreateTilemapMetadataMap";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemapAssets = (scene: SceneWithPlugins, map: Tilemaps.Tilemap) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap, objectLayerMap, tilemapKey, worldData } = storeToRefs(worldSceneStore);

  tilemap.value = map;
  CreateTilemapMetadataMap[tilemapKey.value]();

  for (const { x, y } of objectLayerMap.value[ObjectgroupName.Chest].objects) {
    if (!(x && y)) continue;

    const position = useObjectUnitPosition({ x, y });
    const chestId = getChestId(position);
    if (worldData.value.chestMap.has(chestId)) continue;
    else worldData.value.chestMap.set(chestId, new Chest());
  }

  scene.gridEngine.create(tilemap.value as Tilemaps.Tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
};

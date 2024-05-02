import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { Chest } from "@/models/dungeons/data/world/Chest";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CreateTilemapAssetsMap } from "@/models/dungeons/tilemap/CreateTilemapAssetsMap";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemap = (scene: SceneWithPlugins, key: TilemapKey) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap, tilemapKey, objectLayerMap, worldData } = storeToRefs(worldSceneStore);

  tilemapKey.value = key;
  tilemap.value = scene.make.tilemap({ key: tilemapKey.value });
  CreateTilemapAssetsMap[tilemapKey.value]();

  for (const { x, y } of objectLayerMap.value[ObjectgroupName.Chest].objects) {
    if (!(x && y)) continue;
    // Chests are rendered separately outside of the tilemap as images
    // so we don't need to convert to the unit position
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

  onShutdown(() => {
    tilemap.value.destroy();
  }, scene.scene.key);
};

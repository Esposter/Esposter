import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { Chest } from "@/models/dungeons/data/world/Chest";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CreateTilemapAssetsMap } from "@/models/dungeons/tilemap/CreateTilemapAssetsMap";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { getChestKey } from "@/services/dungeons/getChestKey";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemap = (scene: SceneWithPlugins, tilemapKey: TilemapKey) => {
  const worldSceneStore = useWorldSceneStore();
  const { world, tilemap, chestLayer } = storeToRefs(worldSceneStore);

  tilemap.value = scene.make.tilemap({ key: tilemapKey });
  CreateTilemapAssetsMap[tilemapKey]();

  for (const { x, y } of chestLayer.value.objects) {
    if (!(x && y)) continue;

    const unitPosition = useObjectUnitPosition({ x, y });
    const chestKey = getChestKey(unitPosition);
    if (world.value[tilemapKey].chestMap.has(chestKey)) continue;
    else world.value[tilemapKey].chestMap.set(chestKey, new Chest());
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

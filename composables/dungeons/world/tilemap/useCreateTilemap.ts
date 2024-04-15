import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CreateTilemapAssetsMap } from "@/models/dungeons/tilemap/CreateTilemapAssetsMap";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemap = (scene: SceneWithPlugins, tilemapKey: TilemapKey) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);

  tilemap.value = scene.make.tilemap({ key: tilemapKey });
  CreateTilemapAssetsMap[tilemapKey]();
  scene.gridEngine.create(tilemap.value as Tilemaps.Tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });

  onShutdown(() => {
    tilemap.value.destroy();
  }, scene.scene.key);
};

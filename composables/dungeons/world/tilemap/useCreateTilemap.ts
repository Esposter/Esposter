import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { CreateTilemapAssetsMap } from "@/models/dungeons/tilemap/CreateTilemapAssetsMap";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemap = (tilemapKey: TilemapKey) => {
  const phaserStore = usePhaserStore();
  const { scene, sceneKey } = storeToRefs(phaserStore);
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);

  tilemap.value = scene.value.make.tilemap({ key: tilemapKey });
  CreateTilemapAssetsMap[tilemapKey]();
  scene.value.gridEngine.create(tilemap.value as Tilemaps.Tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });

  useScenePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
    tilemap.value.destroy();
  });
};

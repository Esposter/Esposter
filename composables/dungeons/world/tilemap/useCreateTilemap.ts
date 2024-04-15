import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { CreateTilemapAssetsMap } from "@/models/dungeons/tilemap/CreateTilemapAssetsMap";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemap = (tilemapKey: TilemapKey) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);

  tilemap.value = scene.value.make.tilemap({ key: tilemapKey });
  CreateTilemapAssetsMap[tilemapKey]();
  scene.value.gridEngine.create(tilemap.value as Tilemaps.Tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });

  onShutdown(() => {
    tilemap.value.destroy();
  });
};

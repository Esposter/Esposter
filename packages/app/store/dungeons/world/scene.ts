import type { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { WorldData } from "@/models/dungeons/data/world/WorldData";
import type { Tilemaps } from "phaser";

import { useDungeonsStore } from "@/store/dungeons";

// We will create the tilemap and its metadata in the world scene vue component
export const ExternalWorldSceneStore = {
  objectLayerMap: new Map<ObjectgroupName, null | Tilemaps.ObjectLayer>(),
  tilemap: null as unknown as Tilemaps.Tilemap,
  // Each tilemap may or may not use any number of layers that it likes
  tilemapKeyLayerMap: new Map<TilemapKey, Map<string, Tilemaps.TilemapLayer | undefined>>(),
};

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { save } = storeToRefs(dungeonsStore);
  const tilemapKey = computed(() => save.value.tilemapKey);
  const switchToTilemap = async (tilemapKey: TilemapKey) => {
    save.value.tilemapKey = tilemapKey;
    // We need to wait for:
    // 1. The player to re-render first in the tilemap before we can teleport it
    // 2. The tilemap key watcher to load the new tilemap from the vue-phaser library
    await nextTick();
  };

  const worldData = computed<WorldData>(() => save.value.world[tilemapKey.value]);

  return {
    switchToTilemap,
    tilemapKey,
    worldData,
  };
});

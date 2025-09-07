import type { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { WorldData } from "#shared/models/dungeons/data/world/WorldData";
import type { Tilemaps } from "phaser";

import { useDungeonsStore } from "@/store/dungeons";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const tilemapKey = computed(() => dungeonsStore.save.tilemapKey);
  const worldData = computed<WorldData>(() => dungeonsStore.save.world[tilemapKey.value]);
  const switchToTilemap = async (tilemapKey: TilemapKey) => {
    dungeonsStore.save.tilemapKey = tilemapKey;
    // We need to wait for:
    // 1. The player to re-render first in the tilemap before we can teleport it
    // 2. The tilemap key watcher to load the new tilemap from the vue-phaser library
    await nextTick();
  };
  // We will create the tilemap and its metadata in the world scene vue component
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const tilemapKeyLayerMap = ref(new Map<TilemapKey, Map<string, Tilemaps.TilemapLayer | undefined>>());
  const layerMap = computed({
    get: () => tilemapKeyLayerMap.value.get(tilemapKey.value),
    set: (newLayerMap) => {
      if (newLayerMap) tilemapKeyLayerMap.value.set(tilemapKey.value, newLayerMap);
      else tilemapKeyLayerMap.value.delete(tilemapKey.value);
    },
  });
  const tilemapKeyObjectLayerMap = ref(new Map<TilemapKey, Map<ObjectgroupName, Tilemaps.ObjectLayer | undefined>>());
  const objectLayerMap = computed({
    get: () => tilemapKeyObjectLayerMap.value.get(tilemapKey.value),
    set: (newObjectLayerMap) => {
      if (newObjectLayerMap) tilemapKeyObjectLayerMap.value.set(tilemapKey.value, newObjectLayerMap);
      else tilemapKeyObjectLayerMap.value.delete(tilemapKey.value);
    },
  });
  return {
    layerMap,
    objectLayerMap,
    switchToTilemap,
    tilemap,
    tilemapKey,
    worldData,
  };
});

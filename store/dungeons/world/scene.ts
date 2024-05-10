import type { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { WorldData } from "@/models/dungeons/data/world/WorldData";
import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Tilemaps } from "phaser";

// We will create the tilemap and its metadata in the world scene vue component
export const ExternalWorldSceneStore = {
  tilemap: null as unknown as Tilemaps.Tilemap,
  // Each tilemap may or may not use any number of layers that it likes
  tilemapKeyLayerMap: new Map<TilemapKey, Map<string, Tilemaps.TilemapLayer | undefined>>(),
  objectLayerMap: new Map<ObjectgroupName, Tilemaps.ObjectLayer | null>(),
};

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const tilemapKey = computed({
    get: () => save.value.tilemapKey,
    set: (newTilemapKey) => {
      save.value.tilemapKey = newTilemapKey;
    },
  });
  const worldData = computed<WorldData>(() => save.value.world[tilemapKey.value]);
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);
  return {
    tilemapKey,
    worldData,
    isMenuVisible,
    menuOptionGrid,
  };
});

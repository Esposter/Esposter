import type { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { WorldData } from "@/models/dungeons/data/world/WorldData";
import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Tilemaps } from "phaser";

// We will create the tilemap and its metadata in the world scene vue component
export const ExternalWorldSceneStore = {
  tilemap: null as unknown as Tilemaps.Tilemap,
  encounterLayer: null as unknown as Tilemaps.TilemapLayer,
  objectLayerMap: {} as Record<ObjectgroupName, Tilemaps.ObjectLayer | null>,
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

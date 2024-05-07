import type { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import type { WorldData } from "@/models/dungeons/data/world/WorldData";
import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  // We will create the tilemap and its metadata in the world scene vue component
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const objectLayerMap = ref({} as Record<ObjectgroupName, Tilemaps.ObjectLayer>);
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);
  const tilemapKey = computed(() => save.value.tilemapKey);
  const worldData = computed<WorldData>(() => save.value.world[tilemapKey.value]);
  return {
    tilemap,
    encounterLayer,
    objectLayerMap,
    isMenuVisible,
    menuOptionGrid,
    tilemapKey,
    worldData,
  };
});

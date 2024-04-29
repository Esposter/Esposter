import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const world = computed(() => save.value.world);
  // We will create the tilemap and its layers in the world scene vue component
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const signLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const chestLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);
  return {
    world,
    tilemap,
    encounterLayer,
    signLayer,
    chestLayer,
    isMenuVisible,
    menuOptionGrid,
  };
});

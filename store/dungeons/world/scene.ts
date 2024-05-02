import type { WorldData } from "@/models/dungeons/data/world/WorldData";
import type { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { MenuOptionGrid } from "@/services/dungeons/scene/world/MenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  // We will create the tilemap and its metadata in the world scene vue component
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const tilemapKey = ref() as Ref<TilemapKey>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const signLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const chestLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);
  const worldData = computed<WorldData>(() => save.value.world[tilemapKey.value]);
  return {
    tilemap,
    tilemapKey,
    encounterLayer,
    signLayer,
    chestLayer,
    isMenuVisible,
    menuOptionGrid,
    worldData,
  };
});

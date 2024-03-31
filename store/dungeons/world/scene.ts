import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import { MenuOptionGrid } from "@/services/dungeons/world/MenuOptionGrid";
import type { Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  // We will create the tilemap and its layers in the world scene
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const signLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const isDialogVisible = ref(false);
  const dialogMessage = ref(new DialogMessage());
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref(MenuOptionGrid);
  return {
    tilemap,
    encounterLayer,
    signLayer,
    isDialogVisible,
    dialogMessage,
    isMenuVisible,
    menuOptionGrid,
  };
});

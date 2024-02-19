import { type Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  // We will create the layers in the world scene
  const tilemap = ref() as Ref<Tilemaps.Tilemap>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const signLayer = ref() as Ref<Tilemaps.ObjectLayer>;
  const isDialogVisible = ref(false);
  const dialogText = ref("");
  return { tilemap, encounterLayer, signLayer, isDialogVisible, dialogText };
});

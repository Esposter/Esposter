import { type Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  // We will create this in the world scene
  const collisionLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;

  return { collisionLayer, encounterLayer };
});

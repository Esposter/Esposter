import { type Tilemaps } from "phaser";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  // We will create these in the world scene
  const encounterLayer = ref() as Ref<Tilemaps.TilemapLayer>;
  const collisionLayer = ref() as Ref<Tilemaps.TilemapLayer>;

  return { encounterLayer, collisionLayer };
});

import { NotInitializedError } from "@/models/error/NotInitializedError";
import { type GameObjects, type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  const scene = computed(() => {
    if (!game.value) throw new NotInitializedError("Game");
    if (!sceneKey.value) throw new NotInitializedError("Scene key");
    return game.value.scene.getScene(sceneKey.value);
  });
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists
  const parentContainer = ref<GameObjects.Container | null>(null);
  return {
    game,
    sceneKey,
    scene,
    parentContainer,
  };
});

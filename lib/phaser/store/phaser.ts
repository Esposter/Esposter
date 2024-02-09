import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  // We will create the scene in the game and ensure that the scene will always exist
  // for the child components by using v-if for the scene value
  const scene = computed(() => {
    if (!game.value) throw new NotInitializedError("Game");
    if (!sceneKey.value) throw new NotInitializedError("Scene key");
    return game.value.scene.getScene<SceneWithPlugins>(sceneKey.value);
  });
  return {
    game,
    sceneKey,
    scene,
  };
});

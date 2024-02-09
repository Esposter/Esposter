import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  // We will create the scene in the game
  // and make sure that it is destroyed before scene is accessed when it's undefined
  // to do this, all child components will use onBeforeUnmount hook when cleaning up
  // and the game will use onUnmounted hook when cleaning up to ensure it is the last one
  const scene = computed(() => {
    if (!game.value) return;
    if (!sceneKey.value) return;
    return game.value.scene.getScene<SceneWithPlugins>(sceneKey.value);
  }) as ComputedRef<SceneWithPlugins>;
  return {
    game,
    sceneKey,
    scene,
  };
});

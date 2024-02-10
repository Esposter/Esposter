import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  // We will create the scene in the game and ensure that the scene will always exist
  // for the child components by using v-if for the scene value
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

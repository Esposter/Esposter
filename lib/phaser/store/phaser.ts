import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  const scene = computed(() => {
    if (!game.value) throw new Error("Game has not been initialized yet");
    if (!sceneKey.value) throw new Error("Scene key has not been initialized yet");
    return game.value.scene.getScene(sceneKey.value);
  });
  return {
    game,
    sceneKey,
    scene,
  };
});

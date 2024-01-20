import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  const sceneKey = ref<string | null>(null);

  return {
    game,
    sceneKey,
  };
});

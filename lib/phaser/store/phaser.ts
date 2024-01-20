import { type Game, type Scene } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  const scene = ref<Scene | null>(null);

  return {
    game,
    scene,
  };
});

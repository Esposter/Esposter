import { useGameStore } from "@/store/dungeons/game";
import type { GameObjects } from "phaser";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const sprite = ref<GameObjects.Sprite>();
  const player = computed({
    get: () => save.value.player,
    set: (newPlayer) => {
      save.value.player = newPlayer;
    },
  });
  const isMoving = ref(false);
  return {
    sprite,
    player,
    isMoving,
  };
});

import { useGameStore } from "@/store/dungeons/game";
import { Direction } from "grid-engine";
import type { GameObjects } from "phaser";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const sprite = ref<GameObjects.Sprite>();
  const position = computed({
    get: () => game.value.player.position,
    set: (newPosition) => {
      game.value.player.position = newPosition;
    },
  });
  const direction = ref(Direction.DOWN);
  const isMoving = ref(false);
  return {
    sprite,
    position,
    direction,
    isMoving,
  };
});

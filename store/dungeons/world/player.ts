import { useGameStore } from "@/store/dungeons/game";
import { Direction } from "grid-engine";
import type { GameObjects } from "phaser";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const sprite = ref<GameObjects.Sprite>();
  const position = computed({
    get: () => save.value.player.position,
    set: (newPosition) => {
      save.value.player.position = newPosition;
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

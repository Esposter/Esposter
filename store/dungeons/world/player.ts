import type { Position } from "grid-engine";
import { Direction } from "grid-engine";
import type { GameObjects } from "phaser";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const sprite = ref<GameObjects.Sprite>();
  const position = ref<Position>({ x: 6, y: 21 });
  const direction = ref(Direction.DOWN);
  const isMoving = ref(false);
  return {
    sprite,
    position,
    direction,
    isMoving,
  };
});

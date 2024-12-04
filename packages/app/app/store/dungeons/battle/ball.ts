import type { Position } from "grid-engine";
import type { GameObjects } from "phaser";

import { BallKey } from "@/models/dungeons/keys/image/UI/BallKey";

export const useBallStore = defineStore("dungeons/battle/ball", () => {
  const pathFollower = ref<GameObjects.PathFollower>();
  const isVisible = ref(false);
  const startPosition = Object.freeze<Position>({ x: 0, y: 500 });
  const endPosition = Object.freeze<Position>({ x: 725, y: 180 });
  const texture = ref(BallKey.DamagedBall);
  return {
    endPosition,
    isVisible,
    pathFollower,
    startPosition,
    texture,
  };
});

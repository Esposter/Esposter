import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { Position } from "grid-engine-headless";
import type { GameObjects } from "phaser";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

export const useBallStore = defineStore("dungeons/battle/ball", () => {
  const pathFollower = ref<GameObjects.PathFollower>();
  const isVisible = ref(false);
  const startPosition = Object.freeze<Position>({ x: 0, y: 500 });
  const endPosition = Object.freeze<Position>({ x: 725, y: 180 });
  const texture = ref<DungeonsKey>(DungeonsKeys.UIBallsDamagedBall);
  return { endPosition, isVisible, pathFollower, startPosition, texture };
});

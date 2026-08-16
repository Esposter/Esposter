import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ANIMATION_FRAME_RATE } from "@/services/dungeons/animation/constants";

// Every animation in the game plays its frames through once, at the same rate
export const getAnimationConfiguration = (
  scene: SceneWithPlugins,
  key: string,
  frameConfiguration?: Types.Animations.GenerateFrameNumbers,
): Types.Animations.Animation => ({
  delay: 0,
  frameRate: ANIMATION_FRAME_RATE,
  frames: scene.anims.generateFrameNumbers(key, frameConfiguration),
  key,
  repeat: 0,
});

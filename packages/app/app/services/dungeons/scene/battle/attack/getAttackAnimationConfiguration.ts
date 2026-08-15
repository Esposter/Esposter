import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ATTACK_FRAME_RATE } from "@/services/dungeons/scene/battle/attack/constants";

// Every attack animation plays its spritesheet through once, at the same rate
export const getAttackAnimationConfiguration = (
  scene: SceneWithPlugins,
  key: SpritesheetKey,
): Types.Animations.Animation => ({
  delay: 0,
  frameRate: ATTACK_FRAME_RATE,
  frames: scene.anims.generateFrameNumbers(key),
  key,
  repeat: 0,
});

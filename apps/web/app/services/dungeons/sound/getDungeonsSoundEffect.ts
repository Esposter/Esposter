import type { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import type { Types } from "phaser";
import type { Except } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

export const getDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => getDungeonsSound(scene, soundEffectKey, { ...options, volume: 5 });

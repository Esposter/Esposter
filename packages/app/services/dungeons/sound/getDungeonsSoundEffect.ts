import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Types } from "phaser";
import type { Except } from "type-fest";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

export const getDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => getDungeonsSound(scene, soundEffectKey, { ...options, volume: 5 });

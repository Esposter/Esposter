import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export const playDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => {
  const { play } = getDungeonsSound(scene, soundEffectKey, { ...options, volume: 5 });
  play();
};

import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export const useDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => useDungeonsSound(scene, soundEffectKey, { ...options, volume: 5 });

import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export const useDungeonsSoundEffect = (
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => useDungeonsSound(soundEffectKey, { ...options, volume: 5 });

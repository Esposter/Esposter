import type { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import type { Except } from "@/util/types/Except";
import type { Types } from "phaser";

export const useDungeonsSoundEffect = (
  soundEffectKey: SoundEffectKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => useDungeonsSound(soundEffectKey, { ...options, volume: 5 });

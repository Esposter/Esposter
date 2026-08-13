import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { mergeObjectsStrict } from "@esposter/shared";

export const SoundKey = mergeObjectsStrict(BackgroundMusicKey, SoundEffectKey);
export type SoundKey = BackgroundMusicKey | SoundEffectKey;

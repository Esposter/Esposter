import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

export const SoundKey = mergeObjectsStrict(BackgroundMusicKey, SoundEffectKey);
export type SoundKey = BackgroundMusicKey | SoundEffectKey;

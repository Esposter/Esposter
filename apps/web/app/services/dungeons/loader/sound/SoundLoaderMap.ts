import { BackgroundMusicLoaderMap } from "@/services/dungeons/loader/sound/BackgroundMusicLoaderMap";
import { SoundEffectLoaderMap } from "@/services/dungeons/loader/sound/SoundEffectLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SoundLoaderMap = mergeObjectsStrict(BackgroundMusicLoaderMap, SoundEffectLoaderMap);

export const SoundLoaders = Object.values(SoundLoaderMap);

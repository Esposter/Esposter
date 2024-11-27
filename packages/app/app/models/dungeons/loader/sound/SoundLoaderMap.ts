import { BackgroundMusicLoaderMap } from "@/models/dungeons/loader/sound/BackgroundMusicLoaderMap";
import { SoundEffectLoaderMap } from "@/models/dungeons/loader/sound/SoundEffectLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SoundLoaderMap = mergeObjectsStrict(BackgroundMusicLoaderMap, SoundEffectLoaderMap);

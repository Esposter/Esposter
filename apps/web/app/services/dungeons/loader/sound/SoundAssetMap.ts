import type { AudioFileKey } from "#shared/generated/phaser/FileKey";

import { BackgroundMusicAssetMap } from "#src/services/dungeons/loader/sound/BackgroundMusicAssetMap";
import { SoundEffectAssetMap } from "#src/services/dungeons/loader/sound/SoundEffectAssetMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SoundAssetMap: Record<AudioFileKey, string> = mergeObjectsStrict(
  BackgroundMusicAssetMap,
  SoundEffectAssetMap,
);

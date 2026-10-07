import type { MusicHierarchy } from "#src/models/genshinAssets/music/MusicHierarchy";
import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";

import { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";
import { parseMusicHierarchy } from "#src/services/genshinAssets/music/parseMusicHierarchy";
import { parseSoundBankObjects } from "#src/services/genshinAssets/music/parseSoundBankObjects";
import { readGameSoundBanks } from "#src/services/genshinAssets/music/readGameSoundBanks";

const MUSIC_OBJECT_TYPES: ReadonlySet<SoundBankObjectType> = new Set([
  SoundBankObjectType.MusicPlaylist,
  SoundBankObjectType.MusicSegment,
  SoundBankObjectType.MusicSwitch,
  SoundBankObjectType.MusicTrack,
]);
// The installed game's interactive music, read from every sound bank of every bank package: a bank names the objects
// Of another, so the hierarchy is parsed once all of them are read
export const readGameMusicHierarchy = async (): Promise<MusicHierarchy> => {
  const objects: SoundBankObject[] = [];
  for await (const bank of readGameSoundBanks()) objects.push(...parseSoundBankObjects(bank, MUSIC_OBJECT_TYPES));
  return parseMusicHierarchy(objects);
};

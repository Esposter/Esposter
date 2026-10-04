import type { MusicHierarchy } from "#src/models/genshinAssets/music/MusicHierarchy";
import type { MusicObject } from "#src/models/genshinAssets/music/MusicObject";

import { parseMusicHierarchy } from "#src/services/genshinAssets/music/parseMusicHierarchy";
import { readGameAudioPackages } from "#src/services/genshinAssets/music/readGameAudioPackages";
import { readSoundBankMusicObjects } from "#src/services/genshinAssets/music/readSoundBankMusicObjects";
import { SOUND_BANK_PACKAGE_PATTERN } from "#src/services/genshinAssets/shared/constants";
import { open } from "node:fs/promises";

// The installed game's interactive music, read from every sound bank of every bank package: a bank names the objects
// Of another, so the hierarchy is parsed once all of them are read
export const readGameMusicHierarchy = async (): Promise<MusicHierarchy> => {
  const objects: MusicObject[] = [];
  for (const { audioPackage, path } of await readGameAudioPackages(SOUND_BANK_PACKAGE_PATTERN)) {
    // oxlint-disable-next-line no-await-in-loop -- one package is held open at a time
    await using file = await open(path);
    for (const { offset, size } of audioPackage.banks) {
      const bank = Buffer.alloc(size);
      // oxlint-disable-next-line no-await-in-loop -- a package's banks are read in turn from its one handle
      await file.read(bank, 0, size, offset);
      objects.push(...readSoundBankMusicObjects(bank));
    }
  }
  return parseMusicHierarchy(objects);
};

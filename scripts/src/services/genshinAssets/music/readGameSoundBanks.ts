import { readFileRange } from "#src/services/genshinAssets/music/readFileRange";
import { readGameAudioPackages } from "#src/services/genshinAssets/music/readGameAudioPackages";
import { SOUND_BANK_PACKAGE_PATTERN } from "#src/services/genshinAssets/shared/constants";
import { open } from "node:fs/promises";

// Every sound bank of every installed bank package, one at a time, each package held open while its banks are read
export const readGameSoundBanks = async function* (): AsyncGenerator<Buffer> {
  for (const { audioPackage, path } of await readGameAudioPackages(SOUND_BANK_PACKAGE_PATTERN)) {
    // oxlint-disable-next-line no-await-in-loop -- one package is held open at a time
    await using file = await open(path);
    for (const { offset, size } of audioPackage.banks)
      // oxlint-disable-next-line no-await-in-loop -- a package's banks are read in turn from its one handle
      yield await readFileRange(file, path, offset, size);
  }
};

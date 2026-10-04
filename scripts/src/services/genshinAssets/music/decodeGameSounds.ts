import { readGameAudioPackages } from "#src/services/genshinAssets/music/readGameAudioPackages";
import { resolveVgmstream } from "#src/services/genshinAssets/music/resolveVgmstream";
import { MUSIC_PACKAGE_PATTERN } from "#src/services/genshinAssets/shared/constants";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, open, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Each of the music packages' sounds a filter keeps, decoded as WAV into a folder by its id and yielded one at a time,
// So a caller reading every sound deletes each before the next is decoded; a sound already decoded there is yielded
// As it is
export const decodeGameSounds = async function* (
  filter: (id: number) => boolean,
  directory: string,
): AsyncGenerator<{ id: number; path: string }> {
  await mkdir(directory, { recursive: true });
  const vgmstreamPath = await resolveVgmstream();
  for (const { audioPackage, path } of await readGameAudioPackages(MUSIC_PACKAGE_PATTERN)) {
    // oxlint-disable-next-line no-await-in-loop -- one package is held open at a time
    await using file = await open(path);
    for (const { id, offset, size } of audioPackage.sounds) {
      if (!filter(id)) continue;
      const wavePath = join(directory, `${id}.wav`);
      if (!existsSync(wavePath)) {
        const sound = Buffer.alloc(size);
        // oxlint-disable-next-line no-await-in-loop -- a package's sounds are read in turn from its one handle
        await file.read(sound, 0, size, offset);
        const soundPath = join(directory, `${id}.wem`);
        // oxlint-disable-next-line no-await-in-loop -- vgmstream decodes the sound once it is written
        await writeFile(soundPath, sound);
        // Decoded beside the WAV and renamed onto it, so a decode cut short is never read as a whole sound
        const partialPath = join(directory, `${id}.partial.wav`);
        execFileSync(vgmstreamPath, ["-o", partialPath, soundPath], { stdio: "ignore" });
        // oxlint-disable-next-line no-await-in-loop -- the WAV is whole once vgmstream exits
        await rename(partialPath, wavePath);
        // oxlint-disable-next-line no-await-in-loop -- the encoded sound is dropped once its WAV is written
        await rm(soundPath);
      }
      yield { id, path: wavePath };
    }
  }
};

import type { AudioPackage } from "#src/models/genshinAssets/AudioPackage";

import { GAME_AUDIO_DIRECTORY } from "#src/services/genshinAssets/constants";
import { parseAudioPackageHeader } from "#src/services/genshinAssets/parseAudioPackageHeader";
import { globSync } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";

// The size the header states sits after the magic, so its first eight bytes say how many more to read
const HEADER_PREFIX_LENGTH = 8;
// Every installed audio package a pattern names, by its path, its tables read from its header alone
export const readGameAudioPackages = (pattern: string): Promise<{ audioPackage: AudioPackage; path: string }[]> =>
  Promise.all(
    globSync(pattern, { cwd: GAME_AUDIO_DIRECTORY }).map(async (name) => {
      const path = join(GAME_AUDIO_DIRECTORY, name);
      await using file = await open(path);
      const prefix = Buffer.alloc(HEADER_PREFIX_LENGTH);
      await file.read(prefix, 0, HEADER_PREFIX_LENGTH, 0);
      const header = Buffer.alloc(HEADER_PREFIX_LENGTH + prefix.readUInt32LE(4));
      await file.read(header, 0, header.length, 0);
      return { audioPackage: parseAudioPackageHeader(header), path };
    }),
  );

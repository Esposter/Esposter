import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { linkBlockFiles } from "#src/services/genshinAssets/blocks/linkBlockFiles";
import { listBlockFiles } from "#src/services/genshinAssets/blocks/listBlockFiles";
import {
  GAME_BLOCKS_DIRECTORY,
  GAME_PERSISTENT_BLOCKS_DIRECTORY,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";

// Links the copy of each block the game loads under `INSTALLED_BLOCKS_DIRECTORY`: its hotfix under `Persistent` where
// The game downloaded one, else its StreamingAssets copy, so a hotfixed block is read as the game reads it and a block
// Only a hotfix ships is read at all. Returns the files linked, in path order
export const linkInstalledBlocks = async (): Promise<BlockFile[]> => {
  const persistentFiles = existsSync(GAME_PERSISTENT_BLOCKS_DIRECTORY)
    ? await listBlockFiles(GAME_PERSISTENT_BLOCKS_DIRECTORY)
    : [];
  const persistentPaths = new Set(persistentFiles.map(({ path }) => path));
  const streamingFiles = (await listBlockFiles(GAME_BLOCKS_DIRECTORY)).filter(({ path }) => !persistentPaths.has(path));
  await rm(INSTALLED_BLOCKS_DIRECTORY, { force: true, recursive: true });
  await linkBlockFiles(streamingFiles, GAME_BLOCKS_DIRECTORY, INSTALLED_BLOCKS_DIRECTORY);
  await linkBlockFiles(persistentFiles, GAME_PERSISTENT_BLOCKS_DIRECTORY, INSTALLED_BLOCKS_DIRECTORY);
  return [...streamingFiles, ...persistentFiles].toSorted((firstFile, secondFile) =>
    firstFile.path < secondFile.path ? -1 : Number(firstFile.path > secondFile.path),
  );
};

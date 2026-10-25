import type { DumpFile } from "#src/models/genshinText/DumpFile";

import {
  BIN_OUTPUT_DIRECTORY,
  GAME_TEXT_DIRECTORY,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { listRemoteDirectory } from "#src/services/genshinText/listRemoteDirectory";
import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Each BinOutput file the dump already holds, listed from its folder's remote listing. A reader names the binaries it
// Reads, a quest or a scene's points, and the fetch keeps those at the install's build rather than listing the tens of
// Thousands of the whole folder
export const listHeldBinaryFiles = async (questListing: readonly DumpFile[]): Promise<DumpFile[]> => {
  const binaryDirectory = join(GAME_TEXT_DIRECTORY, BIN_OUTPUT_DIRECTORY);
  if (!existsSync(binaryDirectory)) return [];
  const heldPaths = new Set(
    readdirSync(binaryDirectory, { recursive: true, withFileTypes: true }).flatMap((entry) =>
      entry.isFile() ? [relative(GAME_TEXT_DIRECTORY, join(entry.parentPath, entry.name)).split(sep).join("/")] : [],
    ),
  );
  const directories = new Set(Array.from(heldPaths, (path) => path.slice(0, path.lastIndexOf("/"))));
  const listings = await Promise.all(
    Array.from(directories, (directory) =>
      directory === QUEST_BINARY_DIRECTORY_PATH ? Promise.resolve(questListing) : listRemoteDirectory(directory),
    ),
  );
  return listings.flat().filter(({ path }) => heldPaths.has(path));
};

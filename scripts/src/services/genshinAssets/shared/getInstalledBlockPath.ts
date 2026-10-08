import { GAME_BLOCKS_DIRECTORY, GAME_PERSISTENT_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The file a block is read from: its hotfixed copy under `Persistent` where the game has one, else its StreamingAssets
// Copy, so an export reads what the installed game actually loads
export const getInstalledBlockPath = (block: string): string => {
  const persistentPath = join(GAME_PERSISTENT_BLOCKS_DIRECTORY, block);
  return existsSync(persistentPath) ? persistentPath : join(GAME_BLOCKS_DIRECTORY, block);
};

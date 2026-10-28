import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { GameDataLock } from "genshin-world";

import { GAME_DATA_KEYS_FILE_NAME, GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { mergeGameDataLock } from "#src/services/gameData/mergeGameDataLock";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeGameDataKeys } from "#src/services/gameData/writeGameDataKeys";
import { writeGameDataLock } from "#src/services/gameData/writeGameDataLock";
import { dirname, join } from "node:path";

// Merges a publication's planned entries onto the lock as it stands now, not as it stood when the publication began: the
// Upload in between can take minutes, and a publication of another scope may have committed in that time
export const commitGameDataLock = async (
  scopes: GameDataScope[],
  plannedLock: GameDataLock,
  lockPath: string = GAME_DATA_LOCK_PATH,
): Promise<void> => {
  const lock = mergeGameDataLock(await readGameDataLock(lockPath), scopes, plannedLock);
  await writeGameDataLock(lock, lockPath);
  await writeGameDataKeys(lock, join(dirname(lockPath), GAME_DATA_KEYS_FILE_NAME));
};

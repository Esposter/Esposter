import type { GameDataLock, GameDataset } from "genshin-world";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { mergeGameDataLock } from "#src/services/gameData/mergeGameDataLock";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeGameDataLock } from "#src/services/gameData/writeGameDataLock";

// Merges a publication's planned entries onto the lock as it stands now, not as it stood when the publication began: the
// Upload in between can take minutes, and a publication of another scope may have committed in that time
export const commitGameDataLock = async (
  scopes: GameDataset[],
  plannedLock: GameDataLock,
  lockPath: string = GAME_DATA_LOCK_PATH,
): Promise<void> => {
  await writeGameDataLock(mergeGameDataLock(await readGameDataLock(lockPath), scopes, plannedLock), lockPath);
};

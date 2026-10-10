import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the lock through a partial file of its own, so an interrupted write leaves the committed lock whole and
// Two writes in one checkout never share a partial file
export const writeGameDataLock = async (lock: GameDataLock, lockPath: string = GAME_DATA_LOCK_PATH): Promise<void> => {
  await publishFile(lockPath, formatGameDataLock(lock));
};

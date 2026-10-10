import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { rename, writeFile } from "node:fs/promises";

// Written to a temporary file of its own and renamed over the lock, so an interrupted write leaves the committed lock whole
// And two writes in one checkout never share a temporary file
export const writeGameDataLock = async (lock: GameDataLock, lockPath: string = GAME_DATA_LOCK_PATH): Promise<void> => {
  const temporaryPath = `${lockPath}.${crypto.randomUUID()}.part`;
  await writeFile(temporaryPath, formatGameDataLock(lock));
  await rename(temporaryPath, lockPath);
};

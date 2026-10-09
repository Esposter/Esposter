import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { rename, writeFile } from "node:fs/promises";

// Written to a temporary file and renamed over the lock, so an interrupted write leaves the committed lock whole
export const writeGameDataLock = async (lock: GameDataLock, lockPath: string = GAME_DATA_LOCK_PATH): Promise<void> => {
  const temporaryPath = `${lockPath}.part`;
  await writeFile(temporaryPath, formatGameDataLock(lock));
  await rename(temporaryPath, lockPath);
};

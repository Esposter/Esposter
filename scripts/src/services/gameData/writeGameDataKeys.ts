import type { GameDataLock } from "genshin-world";

import { getGameDataKeysSource } from "#src/services/gameData/getGameDataKeysSource";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole
export const writeGameDataKeys = (lock: GameDataLock, keysPath: string): Promise<void> =>
  publishFile(keysPath, getGameDataKeysSource(lock));

import type { GameDataLock } from "genshin-world";

import { getGameDataKeysSource } from "#src/services/gameData/getGameDataKeysSource";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole
export const writeGameDataKeys = async (lock: GameDataLock, keysPath: string): Promise<void> =>
  publishFile(keysPath, await formatGeneratedSource(keysPath, getGameDataKeysSource(lock)));

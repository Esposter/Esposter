import type { HostedAssetLock } from "hosted-assets";

import { getGameDataKeysSource } from "#src/services/gameData/getGameDataKeysSource";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole
export const writeGameDataKeys = async (lock: HostedAssetLock, keysPath: string): Promise<void> =>
  publishFile(keysPath, await formatGeneratedSource(keysPath, getGameDataKeysSource(lock)));

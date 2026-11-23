import type { GameDataKey } from "#src/generated/gameDataKeys";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { getGameDataObjectPath } from "#src/services/data/getGameDataObjectPath";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The path a record read by its key is stored at: under its key, named by the hash the lock holds. It takes the key
// Alone, so no caller can pair a dataset with a hash of its own
export const getGameDataRecordPath = (key: GameDataKey): string => {
  const hash: string | undefined = gameDataLock.objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return getGameDataObjectPath(key, hash);
};

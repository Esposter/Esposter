import type { GameDataKey } from "#src/models/data/GameDataKey";

import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gameDataLock } from "#src/services/data/gameDataLock";

// Every key the game data lock names, typed as game data keys, in the lock's order
export const gameDataLockKeys: readonly GameDataKey[] = Object.keys(gameDataLock.objects).filter((key) =>
  checkIsGameDataKey(key),
);

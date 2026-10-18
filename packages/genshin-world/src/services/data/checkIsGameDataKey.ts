import type { GameDataKey } from "#src/models/data/GameDataKey";

import { gameDataLock } from "#src/services/data/gameDataLock";

// Whether a key is one a publish wrote into the game data lock
export const checkIsGameDataKey = (key: string): key is GameDataKey => Object.hasOwn(gameDataLock.objects, key);

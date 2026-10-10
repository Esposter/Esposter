import type { GameDataLock } from "#src/models/data/GameDataLock";

import gameDataLockJson from "#src/generated/gameDataLock.json";

// The lock as the build holds it: its hashes are what every reader fetches, and the committed file is the only copy
export const gameDataLock: GameDataLock = gameDataLockJson;

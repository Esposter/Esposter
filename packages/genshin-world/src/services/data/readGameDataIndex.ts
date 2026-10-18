import type { GameDataIndex } from "#src/models/data/GameDataIndex";
import type { GameDataIndexKey } from "#src/models/data/GameDataIndexKey";

import { gameDataIndexSchema } from "#src/models/data/GameDataIndex";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// An index object as the lock names it: each entry id mapped to the sha256 of that entry's record
export const readGameDataIndex = async (
  gameDataBaseUrl: string,
  indexKey: GameDataIndexKey,
): Promise<GameDataIndex> => {
  const indexHash: string | undefined = gameDataLock.indexes[indexKey];
  if (indexHash === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  return gameDataIndexSchema.parse(await readGameDataObject(gameDataBaseUrl, indexHash));
};

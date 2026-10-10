import type { GameDataIndexKey } from "#src/models/data/GameDataIndexKey";
import type { z } from "zod";

import { gameDataIndexSchema } from "#src/models/data/GameDataIndex";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A record read by an id, found through its index: the index object names the record's hash, and an id the index does
// Not name is a missing entry rather than a fetch of a guessed object
export const readGameDataEntry = async <T>(
  gameDataBaseUrl: string,
  indexKey: GameDataIndexKey,
  entryId: string,
  schema: z.ZodType<T>,
): Promise<T> => {
  const indexHash: string | undefined = gameDataLock.indexes[indexKey];
  if (indexHash === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  const index = gameDataIndexSchema.parse(await readGameDataObject(gameDataBaseUrl, indexHash));
  const hash = index[entryId];
  if (hash === undefined)
    throw new InvalidOperationError(Operation.Read, `${indexKey}/${entryId}`, "is not in its index");
  return schema.parse(await readGameDataObject(gameDataBaseUrl, hash));
};

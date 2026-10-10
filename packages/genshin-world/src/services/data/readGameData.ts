import type { GameDataKey } from "#src/models/data/GameDataKey";
import type { z } from "zod";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A record read by its key: the lock names its hash, and its schema parses it, a copy for each caller
export const readGameData = async <T>(gameDataBaseUrl: string, key: GameDataKey, schema: z.ZodType<T>): Promise<T> => {
  const hash: string | undefined = gameDataLock.objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return schema.parse(await readGameDataObject(gameDataBaseUrl, hash));
};

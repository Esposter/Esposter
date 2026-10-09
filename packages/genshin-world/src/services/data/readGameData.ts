import type { z } from "zod";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A record read by its key, parsed by the reader's own schema every time so each caller holds a value of its own. A key
// The lock does not name is a missing record, never a fetch of a guessed object
export const readGameData = async <T>(gameDataBaseUrl: string, key: string, schema: z.ZodType<T>): Promise<T> => {
  const hash = gameDataLock.objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return schema.parse(await readGameDataObject(gameDataBaseUrl, hash));
};

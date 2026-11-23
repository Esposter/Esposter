import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { z } from "zod";

import { getGameDataRecordPath } from "#src/services/data/getGameDataRecordPath";
import { readGameDataObject } from "#src/services/data/readGameDataObject";

// A record read by its key: the path names the hash the lock holds, and its schema parses it, a copy for each caller
export const readGameData = async <T>(gameDataBaseUrl: string, key: GameDataKey, schema: z.ZodType<T>): Promise<T> =>
  schema.parse(await readGameDataObject(gameDataBaseUrl, getGameDataRecordPath(key)));

import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { z } from "zod";

import { getGameDataRecord } from "#src/services/data/getGameDataRecord";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { getHostedAssetUrl } from "hosted-assets";

// A record read by its key: the lock names its object, and its schema parses it, a copy for each caller
export const readGameData = async <T>(gameDataBaseUrl: string, key: GameDataKey, schema: z.ZodType<T>): Promise<T> =>
  schema.parse(await readGameDataObject(getHostedAssetUrl(gameDataBaseUrl, getGameDataRecord(key))));

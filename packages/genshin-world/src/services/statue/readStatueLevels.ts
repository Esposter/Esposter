import type { GameDataKey } from "#src/models/data/GameDataKey";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { statueLevelSchema } from "#src/models/statue/StatueLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's statue levels `pnpm -C scripts genshin:assets statues` publishes, fetched by its key from the hosted game
// Data and checked against its shape as it arrives. The key is typed off the lock, so a region no publish wrote fails
// Typecheck
export const readStatueLevels = (
  gameDataBaseUrl: string,
  key: Extract<GameDataKey, `statueLevels/${string}`>,
): Promise<StatueLevel[]> => readGameData(gameDataBaseUrl, key, z.array(statueLevelSchema));

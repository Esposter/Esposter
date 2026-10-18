import type { GameDataKey } from "#src/models/data/GameDataKey";
import type { OutcropRegion } from "#src/models/leyLine/OutcropRegion";

import { outcropRegionSchema } from "#src/models/leyLine/OutcropRegion";
import { readGameData } from "#src/services/data/readGameData";

// A region's ley line outcrops `pnpm -C scripts genshin:assets outcrops` publishes, fetched by its key from the hosted game
// Data and checked against its shape as it arrives. The key is typed off the lock, so a region no publish wrote fails
// Typecheck
export const readOutcropRegion = (
  gameDataBaseUrl: string,
  key: Extract<GameDataKey, `leyLine/regions/${string}`>,
): Promise<OutcropRegion> => readGameData(gameDataBaseUrl, key, outcropRegionSchema);

import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { reliquarySetDataSchema } from "#src/models/reliquary/ReliquarySetData";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The artifact sets `pnpm -C scripts genshin:assets items` publishes
// Fetched by its key from the hosted game data and checked against their shape as they arrive
export const readReliquarySets = (gameDataBaseUrl: string): Promise<ReliquarySetData[]> =>
  readGameData(gameDataBaseUrl, "items/reliquarySets", z.array(reliquarySetDataSchema));

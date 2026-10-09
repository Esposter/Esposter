import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { statueLevelSchema } from "#src/models/statue/StatueLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's statue levels `pnpm -C scripts genshin:assets statues` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtStatueLevels = (gameDataBaseUrl: string): Promise<StatueLevel[]> =>
  readGameData(gameDataBaseUrl, "statueLevels/mondstadt", z.array(statueLevelSchema));

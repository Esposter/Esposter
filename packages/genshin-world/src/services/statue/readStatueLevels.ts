import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { GameDataset } from "#src/models/data/GameDataset";
import { statueLevelSchema } from "#src/models/statue/StatueLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's statue levels `pnpm -C scripts genshin:assets statues` publishes, fetched by its key from the hosted game
// Data and checked against its shape as it arrives
export const readStatueLevels = (gameDataBaseUrl: string, id: string): Promise<StatueLevel[]> =>
  readGameData(gameDataBaseUrl, `${GameDataset.StatueLevels}/${id}`, z.array(statueLevelSchema));

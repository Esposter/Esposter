import type { FishProficient } from "#src/models/fishing/FishProficient";

import { fishProficientSchema } from "#src/models/fishing/FishProficient";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The proficiencies `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishProficiencies = (gameDataBaseUrl: string): Promise<FishProficient[]> =>
  readGameData(gameDataBaseUrl, "fishing/proficiency", z.array(fishProficientSchema));

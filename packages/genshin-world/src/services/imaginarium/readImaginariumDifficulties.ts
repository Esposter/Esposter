import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";

import { imaginariumDifficultySchema } from "#src/models/imaginarium/ImaginariumDifficulty";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Every difficulty of the Imaginarium Theater `pnpm -C scripts genshin:assets imaginarium` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readImaginariumDifficulties = (gameDataBaseUrl: string): Promise<ImaginariumDifficulty[]> =>
  readGameData(gameDataBaseUrl, "imaginarium/difficulties", z.array(imaginariumDifficultySchema));

import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { imaginariumSeasonSchema } from "#src/models/imaginarium/ImaginariumSeason";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Imaginarium Theater's seasons `pnpm -C scripts genshin:assets imaginarium` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readImaginariumSeasons = (gameDataBaseUrl: string): Promise<ImaginariumSeason[]> =>
  readGameData(gameDataBaseUrl, "imaginarium/seasons", z.array(imaginariumSeasonSchema));

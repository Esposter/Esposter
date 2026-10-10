import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { abyssPeriodSchema } from "#src/models/spiralAbyss/AbyssPeriod";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Moon Spire's periods `pnpm -C scripts genshin:assets spiral-abyss` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readAbyssPeriods = (gameDataBaseUrl: string): Promise<AbyssPeriod[]> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/periods", z.array(abyssPeriodSchema));

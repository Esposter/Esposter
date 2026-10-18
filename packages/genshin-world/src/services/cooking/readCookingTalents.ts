import type { CookingTalent } from "#src/models/cooking/CookingTalent";

import { cookingTalentSchema } from "#src/models/cooking/CookingTalent";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The cooking talents `pnpm -C scripts genshin:assets cooking` publishes, each by its character's id
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readCookingTalents = (gameDataBaseUrl: string): Promise<Record<string, CookingTalent>> =>
  readGameData(gameDataBaseUrl, "cooking/talents", z.record(z.string().regex(/^\d+$/u), cookingTalentSchema));

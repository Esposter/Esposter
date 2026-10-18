import type { DishUse } from "#src/models/cooking/DishUse";

import { dishUseSchema } from "#src/models/cooking/DishUse";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The dishes' uses `pnpm -C scripts genshin:assets cooking` publishes, each by its item id, fetched by its key from the
// Hosted game data and checked against its shape as it arrives
export const readDishes = (gameDataBaseUrl: string): Promise<Record<string, DishUse>> =>
  readGameData(gameDataBaseUrl, "cooking/dishes", z.record(z.string().regex(/^\d+$/u), dishUseSchema));

import type { FishingStock } from "#src/models/fishing/FishingStock";

import { fishingStockSchema } from "#src/models/fishing/FishingStock";
import { z } from "zod";

// A fishing pool as its region's slice holds it: its id in the game's tables, how many fish a point of it holds, and
// The stocks it draws from, day and night
export interface FishingPool {
  id: number;
  maxNum: number;
  stocks: FishingStock[];
}

export const fishingPoolSchema = z.object({
  id: z.int().positive(),
  maxNum: z.int().positive(),
  stocks: z.array(fishingStockSchema),
}) satisfies z.ZodType<FishingPool>;

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

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- FishingStockType is the same declaration on both sides (FishingStock.ts:9 and :14); the rule flags a zod object nested in an array even on an exact enum match
export const fishingPoolSchema = z.object({
  id: z.int().positive(),
  maxNum: z.int().positive(),
  stocks: z.array(fishingStockSchema),
}) satisfies z.ZodType<FishingPool>;

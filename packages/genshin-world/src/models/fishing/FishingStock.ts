import type { FishingWeight } from "#src/models/fishing/FishingWeight";

import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { fishingWeightSchema } from "#src/models/fishing/FishingWeight";
import { z } from "zod";

// A stock a pool holds: the time it is drawn in, and each fish's weight in it
export interface FishingStock {
  type: FishingStockType;
  weights: FishingWeight[];
}

export const fishingStockSchema = z.object({
  type: z.enum(FishingStockType) satisfies z.ZodType<FishingStockType>,
  weights: z.array(fishingWeightSchema),
}) satisfies z.ZodType<FishingStock>;

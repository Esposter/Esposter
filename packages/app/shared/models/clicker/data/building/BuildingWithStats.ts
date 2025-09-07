import type { Building } from "#shared/models/clicker/data/building/Building";

import { buildingSchema } from "#shared/models/clicker/data/building/Building";
import { z } from "zod";

export interface BuildingWithStats extends Building {
  amount: number;
  producedValue: number;
}

export const buildingWithStatsSchema = z.object({
  ...buildingSchema.shape,
  amount: z.number(),
  producedValue: z.number(),
}) satisfies z.ZodType<BuildingWithStats>;

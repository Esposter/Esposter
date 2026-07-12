import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { z } from "zod";

export interface BoughtBuilding {
  amount: number;
  id: BuildingId;
  producedValue: number;
}

export const boughtBuildingSchema = z.object({
  amount: z.int().nonnegative(),
  id: buildingIdSchema,
  producedValue: z.number().nonnegative(),
}) satisfies z.ZodType<BoughtBuilding>;

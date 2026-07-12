import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { z } from "zod";

export interface BoughtBuilding {
  amount: number;
  id: BuildingId;
  producedValue: number;
}

export const boughtBuildingSchema = z.object({
  amount: z.number(),
  id: buildingIdSchema,
  producedValue: z.number(),
}) satisfies z.ZodType<BoughtBuilding>;

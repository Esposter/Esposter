import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { z } from "zod";

export interface Building {
  basePrice: number;
  baseValue: number;
  flavorDescription: string;
  id: BuildingId;
}

export const buildingSchema = z.object({
  basePrice: z.number(),
  baseValue: z.number(),
  flavorDescription: z.string().min(1),
  id: buildingIdSchema,
}) as const satisfies z.ZodType<Building>;

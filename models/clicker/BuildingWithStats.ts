import { buildingSchema } from "@/models/clicker/Building";
import type { Building } from "@/models/clicker/Building";
import { z } from "zod";

export interface BuildingWithStats extends Building {
  amount: number;
  producedValue: number;
}

export const buildingWithStatsSchema = buildingSchema.extend({
  amount: z.number(),
  producedValue: z.number(),
}) satisfies z.ZodType<BuildingWithStats>;

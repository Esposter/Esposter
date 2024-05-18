import type { BuildingId } from "@/models/clicker/data/building/BuildingId";
import { buildingIdSchema } from "@/models/clicker/data/building/BuildingId";
import { z } from "zod";

export interface Building {
  id: BuildingId;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
}

export const buildingSchema = z.object({
  id: buildingIdSchema,
  flavorDescription: z.string().min(1),
  basePrice: z.number(),
  baseValue: z.number(),
}) satisfies z.ZodType<Building>;

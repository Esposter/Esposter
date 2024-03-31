import type { BuildingName } from "@/models/clicker/data/building/BuildingName";
import { buildingNameSchema } from "@/models/clicker/data/building/BuildingName";
import { z } from "zod";

export interface Building {
  name: BuildingName;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
}

export const buildingSchema = z.object({
  name: buildingNameSchema,
  flavorDescription: z.string().min(1),
  basePrice: z.number(),
  baseValue: z.number(),
}) satisfies z.ZodType<Building>;

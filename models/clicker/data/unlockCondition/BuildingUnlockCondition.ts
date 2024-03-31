import type { BuildingName } from "@/models/clicker/data/building/BuildingName";
import { buildingNameSchema } from "@/models/clicker/data/building/BuildingName";
import { z } from "zod";

export interface BuildingUnlockCondition {
  target: BuildingName;
  amount: number;
}

export const buildingUnlockConditionSchema = z.object({
  target: buildingNameSchema,
  amount: z.number().int(),
}) satisfies z.ZodType<BuildingUnlockCondition>;

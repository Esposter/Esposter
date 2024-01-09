import { buildingNameSchema, type BuildingName } from "@/models/clicker/BuildingName";
import { z } from "zod";

export interface BuildingUnlockCondition {
  target: BuildingName;
  amount: number;
}

export const buildingUnlockConditionSchema = z.object({
  target: buildingNameSchema,
  amount: z.number().int(),
}) satisfies z.ZodType<BuildingUnlockCondition>;

import { ItemType } from "@/models/clicker/data/ItemType";
import type { BuildingId } from "@/models/clicker/data/building/BuildingId";
import { buildingIdSchema } from "@/models/clicker/data/building/BuildingId";
import { z } from "zod";

export interface BuildingUnlockCondition {
  id: BuildingId;
  type: ItemType.Building;
  amount: number;
}

export const buildingUnlockConditionSchema = z.object({
  id: buildingIdSchema,
  type: z.literal(ItemType.Building),
  amount: z.number().int(),
}) satisfies z.ZodType<BuildingUnlockCondition>;

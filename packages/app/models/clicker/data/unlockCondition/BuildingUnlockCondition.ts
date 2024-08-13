import type { BuildingId } from "@/models/clicker/data/building/BuildingId";

import { buildingIdSchema } from "@/models/clicker/data/building/BuildingId";
import { ItemType } from "@/models/clicker/data/ItemType";
import { z } from "zod";

export interface BuildingUnlockCondition {
  amount: number;
  id: BuildingId;
  type: ItemType.Building;
}

export const buildingUnlockConditionSchema = z.object({
  amount: z.number().int(),
  id: buildingIdSchema,
  type: z.literal(ItemType.Building),
}) satisfies z.ZodType<BuildingUnlockCondition>;

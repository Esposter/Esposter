import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ItemType } from "#shared/models/clicker/data/ItemType";
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
}) as const satisfies z.ZodType<BuildingUnlockCondition>;

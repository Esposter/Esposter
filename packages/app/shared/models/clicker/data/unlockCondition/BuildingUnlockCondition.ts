import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { ItemEntityType } from "@esposter/shared";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ItemType } from "#shared/models/clicker/data/ItemType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface BuildingUnlockCondition extends ItemEntityType<ItemType.Building> {
  amount: number;
  id: BuildingId;
}

export const buildingUnlockConditionSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ItemType.Building)).shape,
  amount: z.int(),
  id: buildingIdSchema,
}) satisfies z.ZodType<BuildingUnlockCondition>;

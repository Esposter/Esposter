import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ItemType } from "#shared/models/clicker/data/ItemType";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod/v4";

export interface BuildingUnlockCondition extends ItemEntityType<ItemType.Building> {
  amount: number;
  id: BuildingId;
}

export const buildingUnlockConditionSchema = createItemEntityTypeSchema(z.literal(ItemType.Building)).extend(
  z.object({
    amount: z.int(),
    id: buildingIdSchema,
  }),
) satisfies z.ZodType<BuildingUnlockCondition>;

import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod";

export interface UpgradeUnlockCondition extends ItemEntityType<ItemType.Upgrade> {
  id: UpgradeId;
}

export const upgradeUnlockConditionSchema = createItemEntityTypeSchema(z.literal(ItemType.Upgrade)).extend(
  z.object({
    id: upgradeIdSchema,
  }),
) satisfies z.ZodType<UpgradeUnlockCondition>;

import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemEntityType } from "@esposter/shared";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface UpgradeUnlockCondition extends ItemEntityType<ItemType.Upgrade> {
  id: UpgradeId;
}

export const upgradeUnlockConditionSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ItemType.Upgrade)).shape,
  id: upgradeIdSchema,
}) satisfies z.ZodType<UpgradeUnlockCondition>;

import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { z } from "zod";

export interface UpgradeUnlockCondition {
  id: UpgradeId;
  type: ItemType.Upgrade;
}

export const upgradeUnlockConditionSchema = z.object({
  id: upgradeIdSchema,
  type: z.literal(ItemType.Upgrade),
}) as const satisfies z.ZodType<UpgradeUnlockCondition>;

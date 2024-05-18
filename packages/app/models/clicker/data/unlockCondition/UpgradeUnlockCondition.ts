import { ItemType } from "@/models/clicker/data/ItemType";
import type { UpgradeId } from "@/models/clicker/data/upgrade/UpgradeId";
import { upgradeIdSchema } from "@/models/clicker/data/upgrade/UpgradeId";
import { z } from "zod";

export interface UpgradeUnlockCondition {
  id: UpgradeId;
  type: ItemType.Upgrade;
}

export const upgradeUnlockConditionSchema = z.object({
  id: upgradeIdSchema,
  type: z.literal(ItemType.Upgrade),
}) satisfies z.ZodType<UpgradeUnlockCondition>;

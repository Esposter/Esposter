import { upgradeNameSchema, type UpgradeName } from "@/models/clicker/UpgradeName";
import { z } from "zod";

export interface UpgradeUnlockCondition {
  target: UpgradeName;
}

export const upgradeUnlockConditionSchema = z.object({
  target: upgradeNameSchema,
}) satisfies z.ZodType<UpgradeUnlockCondition>;

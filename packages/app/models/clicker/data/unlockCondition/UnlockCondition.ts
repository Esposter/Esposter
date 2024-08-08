import type { BuildingUnlockCondition } from "@/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import type { UpgradeUnlockCondition } from "@/models/clicker/data/unlockCondition/UpgradeUnlockCondition";

import { buildingUnlockConditionSchema } from "@/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import { upgradeUnlockConditionSchema } from "@/models/clicker/data/unlockCondition/UpgradeUnlockCondition";
import { z } from "zod";

export type UnlockCondition = BuildingUnlockCondition | UpgradeUnlockCondition;

export const unlockConditionSchema = z.union([
  buildingUnlockConditionSchema,
  upgradeUnlockConditionSchema,
]) satisfies z.ZodType<UnlockCondition>;

import type { BuildingUnlockCondition } from "#shared/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import type { UpgradeUnlockCondition } from "#shared/models/clicker/data/unlockCondition/UpgradeUnlockCondition";

import { buildingUnlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import { upgradeUnlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/UpgradeUnlockCondition";
import { z } from "zod";

export type UnlockCondition = BuildingUnlockCondition | UpgradeUnlockCondition;

export const unlockConditionSchema = z.discriminatedUnion("UnlockCondition", [
  buildingUnlockConditionSchema,
  upgradeUnlockConditionSchema,
]) satisfies z.ZodType<UnlockCondition>;

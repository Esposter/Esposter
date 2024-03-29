import type { BuildingUnlockCondition } from "@/models/clicker/unlockCondition/BuildingUnlockCondition";
import { buildingUnlockConditionSchema } from "@/models/clicker/unlockCondition/BuildingUnlockCondition";
import type { UpgradeUnlockCondition } from "@/models/clicker/unlockCondition/UpgradeUnlockCondition";
import { upgradeUnlockConditionSchema } from "@/models/clicker/unlockCondition/UpgradeUnlockCondition";
import { z } from "zod";

export type UnlockCondition = BuildingUnlockCondition | UpgradeUnlockCondition;

export const unlockConditionSchema = z.union([
  buildingUnlockConditionSchema,
  upgradeUnlockConditionSchema,
]) satisfies z.ZodType<UnlockCondition>;

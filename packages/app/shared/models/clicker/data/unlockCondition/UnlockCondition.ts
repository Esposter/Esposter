import type { BuildingUnlockCondition } from "#shared/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import type { UpgradeUnlockCondition } from "#shared/models/clicker/data/unlockCondition/UpgradeUnlockCondition";
import type { Type } from "arktype";

import { buildingUnlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import { upgradeUnlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/UpgradeUnlockCondition";
import { type } from "arktype";

export type UnlockCondition = BuildingUnlockCondition | UpgradeUnlockCondition;

export const unlockConditionSchema = type.or(
  buildingUnlockConditionSchema,
  upgradeUnlockConditionSchema,
) satisfies Type<UnlockCondition>;

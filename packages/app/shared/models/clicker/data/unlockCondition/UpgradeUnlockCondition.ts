import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { Type } from "arktype";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { type } from "arktype";

export interface UpgradeUnlockCondition {
  id: UpgradeId;
  type: ItemType.Upgrade;
}

export const upgradeUnlockConditionSchema = type({
  id: upgradeIdSchema,
  type: type.enumerated(ItemType.Upgrade),
}) satisfies Type<UpgradeUnlockCondition>;

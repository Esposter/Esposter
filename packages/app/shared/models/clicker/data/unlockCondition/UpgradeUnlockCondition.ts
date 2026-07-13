import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { ItemEntityType } from "@esposter/shared";

export interface UpgradeUnlockCondition extends ItemEntityType<ItemType.Upgrade> {
  id: UpgradeId;
}

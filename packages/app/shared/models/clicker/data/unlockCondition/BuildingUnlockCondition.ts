import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { ItemEntityType } from "@esposter/shared";

export interface BuildingUnlockCondition extends ItemEntityType<ItemType.Building> {
  amount: number;
  id: BuildingId;
}

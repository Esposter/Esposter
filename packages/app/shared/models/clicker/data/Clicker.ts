import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ItemEntityType } from "@esposter/shared";

import { ClickerType } from "#shared/models/clicker/data/ClickerType";
import { AItemEntity } from "#shared/models/entity/AItemEntity";
// The in-memory game state with fully resolved definitions — the persisted shape is `ClickerSave`
export class Clicker extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BuildingWithStatistics[] = [];
  boughtUpgrades: Upgrade[] = [];
  pointCount = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<Clicker>) {
    super();
    Object.assign(this, init);
  }
}

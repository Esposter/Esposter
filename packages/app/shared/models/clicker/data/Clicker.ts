import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ItemEntityType } from "@esposter/shared";

import { ClickerType } from "#shared/models/clicker/data/ClickerType";
import { AItemEntity } from "#shared/models/entity/AItemEntity";
// The in-memory game state with fully resolved definitions — the persisted shape is `ClickerSave`
export class Clicker extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  noPoints = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<Clicker>) {
    super();
    Object.assign(this, init);
  }
}

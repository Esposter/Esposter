import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ToData } from "@esposter/shared";

import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { Clicker } from "#shared/models/clicker/data/Clicker";

// Copies into fresh objects — the content maps are shared definitions and must never be mutated
const toBuildingWithStatistics = ({ amount, id, producedValue }: BoughtBuilding): BuildingWithStatistics => ({
  ...BuildingMap[id],
  amount,
  id,
  producedValue,
});
const toUpgrade = (id: UpgradeId): Upgrade => ({ ...UpgradeMap[id], id });
// Hydrates a parsed save back into the in-memory game state by resolving ids through the content maps
export const toClicker = (clickerSave: ToData<ClickerSave>) => {
  const { boughtBuildings, boughtUpgrades, ...rest } = clickerSave;
  return new Clicker({
    ...rest,
    boughtBuildings: boughtBuildings.map((boughtBuilding) => toBuildingWithStatistics(boughtBuilding)),
    boughtUpgrades: boughtUpgrades.map((id) => toUpgrade(id)),
  });
};

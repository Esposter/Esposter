import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { applyBuildingUpgrade } from "#src/services/clicker/upgrade/applyBuildingUpgrade";

export const applyBuildingUpgrades = (
  basePower: number,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStatistics[],
) => {
  let resultPower = basePower;
  for (const boughtBuilding of boughtBuildings)
    resultPower += applyBuildingUpgrade(boughtBuilding, boughtUpgrades, boughtBuildings);
  return resultPower;
};

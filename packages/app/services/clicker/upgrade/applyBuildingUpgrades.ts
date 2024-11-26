import type { BuildingWithStats } from "@/shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/shared/models/clicker/data/upgrade/Upgrade";

import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";

export const applyBuildingUpgrades = (
  basePower: number,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) => {
  let resultPower = basePower;
  for (const boughtBuilding of boughtBuildings)
    resultPower += applyBuildingUpgrade(boughtBuilding, boughtUpgrades, boughtBuildings);
  return resultPower;
};

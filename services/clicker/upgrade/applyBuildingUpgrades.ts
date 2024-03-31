import type { Upgrade } from "@/models/clicker/data/Upgrade";
import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
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

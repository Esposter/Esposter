import { type BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { type Upgrade } from "@/models/clicker/Upgrade";
import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyBuildingUpgrade = (
  building: BuildingWithStats,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) =>
  applyUpgrades(
    building.baseValue,
    (u) => u.effects.some((e) => e.targets.includes(building.name)),
    boughtUpgrades,
    boughtBuildings,
  ) * building.amount;

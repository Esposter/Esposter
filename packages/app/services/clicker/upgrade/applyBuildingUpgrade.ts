import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";

import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyBuildingUpgrade = (
  building: BuildingWithStats,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) =>
  applyUpgrades(
    building.baseValue,
    (u) => u.effects.some((e) => e.targets.includes(building.id)),
    boughtUpgrades,
    boughtBuildings,
  ) * building.amount;

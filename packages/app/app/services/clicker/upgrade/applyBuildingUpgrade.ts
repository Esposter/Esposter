import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyBuildingUpgrade = (
  building: BuildingWithStats,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) =>
  applyUpgrades(
    building.baseValue,
    ({ effects }) => effects.some(({ targets }) => targets.includes(building.id)),
    boughtUpgrades,
    boughtBuildings,
  ) * building.amount;

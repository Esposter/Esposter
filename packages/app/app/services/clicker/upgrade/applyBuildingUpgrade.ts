import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyBuildingUpgrade = (
  building: BuildingWithStatistics,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStatistics[],
) =>
  applyUpgrades(
    building.baseValue,
    ({ effects }) => effects.some(({ targets }) => targets.includes(building.id)),
    boughtUpgrades,
    boughtBuildings,
  ) * building.amount;

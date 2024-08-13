import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";

import { Target } from "@/models/clicker/data/Target";
import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyMouseUpgrades = (
  basePower: number,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) =>
  applyUpgrades(
    basePower,
    (u) => u.effects.some((e) => e.targets.includes(Target.Mouse)),
    boughtUpgrades,
    boughtBuildings,
  );

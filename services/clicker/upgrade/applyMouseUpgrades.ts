import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { Target } from "@/models/clicker/Target";
import type { Upgrade } from "@/models/clicker/Upgrade";
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

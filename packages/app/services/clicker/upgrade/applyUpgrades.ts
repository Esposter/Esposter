import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";

import { Target } from "@/models/clicker/data/Target";
import { applyEffects } from "@/services/clicker/effect/applyEffects";
import { applyUpgradeEffects } from "@/services/clicker/effect/applyUpgradeEffects";

export const applyUpgrades = (
  basePower: number,
  upgradeFilterPredicate: Parameters<Upgrade[]["filter"]>[0],
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) => {
  const allEffects = boughtUpgrades.flatMap((u) => u.effects);
  const resultUpgrades = boughtUpgrades
    .map((bu) =>
      applyUpgradeEffects(
        bu,
        // We're looking for a special type of "Upgrade Effect"
        // which enhances the effects of upgrades
        allEffects.filter((e) => e.configuration.itemType === Target.Upgrade && e.targets.includes(bu.id)),
        boughtBuildings,
      ),
    )
    .filter(upgradeFilterPredicate);
  const allUpgradedEffects = resultUpgrades.flatMap((u) => u.effects);
  return applyEffects(basePower, allUpgradedEffects, boughtBuildings);
};

import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { applyEffects } from "@/services/clicker/effect/applyEffects";
import { applyUpgradeEffects } from "@/services/clicker/effect/applyUpgradeEffects";

export const applyUpgrades = (
  basePower: number,
  upgradeFilterPredicate: Parameters<Upgrade[]["filter"]>[0],
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) => {
  const allEffects = boughtUpgrades.flatMap(({ effects }) => effects);
  const resultUpgrades = boughtUpgrades
    .map((bu) =>
      applyUpgradeEffects(
        bu,
        // We're looking for a special type of "Upgrade Effect"
        // Which enhances the effects of upgrades
        allEffects.filter(
          ({ configuration, targets }) => configuration.itemType === Target.Upgrade && targets.includes(bu.id),
        ),
        boughtBuildings,
      ),
    )
    .filter((...args) => upgradeFilterPredicate(...args));
  const allUpgradedEffects = resultUpgrades.flatMap(({ effects }) => effects);
  return applyEffects(basePower, allUpgradedEffects, boughtBuildings);
};

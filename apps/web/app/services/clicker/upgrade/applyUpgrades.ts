import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { applyEffects } from "@/services/clicker/effect/applyEffects";
import { applyUpgradeEffects } from "@/services/clicker/effect/applyUpgradeEffects";

export const applyUpgrades = (
  basePower: number,
  upgradeFilterPredicate: (upgrade: Upgrade) => boolean,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStatistics[],
) => {
  const allEffects = boughtUpgrades.flatMap(({ effects }) => effects);
  const resultUpgrades = boughtUpgrades
    .map((boughtUpgrade) =>
      applyUpgradeEffects(
        boughtUpgrade,
        allEffects.filter(
          ({ configuration, targets }) =>
            configuration.itemType === Target.Upgrade && targets.includes(boughtUpgrade.id),
        ),
        boughtBuildings,
      ),
    )
    .filter((upgrade) => upgradeFilterPredicate(upgrade));
  const allUpgradedEffects = resultUpgrades.flatMap(({ effects }) => effects);
  return applyEffects(basePower, allUpgradedEffects, boughtBuildings);
};

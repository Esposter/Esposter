import { ItemType } from "@/models/clicker/data/ItemType";
import type { Upgrade } from "@/models/clicker/data/Upgrade";
import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
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
        allEffects.filter((e) => e.configuration.itemType === ItemType.Upgrade && e.targets.includes(bu.name)),
        boughtBuildings,
      ),
    )
    .filter(upgradeFilterPredicate);
  const allUpgradedEffects = resultUpgrades.flatMap((u) => u.effects);
  return applyEffects(basePower, allUpgradedEffects, boughtBuildings);
};

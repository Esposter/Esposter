import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "@/models/clicker/data/effect/Effect";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";

import { applyEffects } from "@/services/clicker/effect/applyEffects";

export const applyUpgradeEffects = (
  upgrade: Upgrade,
  allUpgradeEffects: Effect[],
  boughtBuildings: BuildingWithStats[],
): Upgrade => {
  const resultEffects: Effect[] = [];
  for (const effect of upgrade.effects)
    resultEffects.push({
      ...effect,
      value: applyEffects(effect.value, allUpgradeEffects, boughtBuildings),
    });
  return { ...upgrade, effects: resultEffects };
};

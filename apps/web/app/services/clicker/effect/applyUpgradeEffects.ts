import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { applyEffects } from "@/services/clicker/effect/applyEffects";

export const applyUpgradeEffects = (
  upgrade: Upgrade,
  allUpgradeEffects: Effect[],
  boughtBuildings: BuildingWithStatistics[],
): Upgrade => ({
  ...upgrade,
  effects: upgrade.effects.map((effect) => ({
    ...effect,
    value: applyEffects(effect.value, allUpgradeEffects, boughtBuildings),
  })),
});

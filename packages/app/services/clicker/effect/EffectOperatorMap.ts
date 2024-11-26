import type { BuildingWithStats } from "@/shared/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "@/shared/models/clicker/data/effect/Effect";

import { applyAdditiveEffects } from "@/services/clicker/effect/applyAdditiveEffects";
import { applyBuildingAdditiveEffects } from "@/services/clicker/effect/applyBuildingAdditiveEffects";
import { applyBuildingAdditiveNorEffects } from "@/services/clicker/effect/applyBuildingAdditiveNorEffects";
import { applyMultiplicativeEffects } from "@/services/clicker/effect/applyMultiplicativeEffects";
import { EffectType } from "@/shared/models/clicker/data/effect/EffectType";

export const EffectOperatorMap = {
  [EffectType.Additive]: applyAdditiveEffects,
  [EffectType.BuildingAdditive]: applyBuildingAdditiveEffects,
  [EffectType.BuildingAdditiveNor]: applyBuildingAdditiveNorEffects,
  [EffectType.Multiplicative]: applyMultiplicativeEffects,
} as const satisfies Record<
  EffectType,
  (basePower: number, effects: Effect[], boughtBuildings: BuildingWithStats[]) => number
>;

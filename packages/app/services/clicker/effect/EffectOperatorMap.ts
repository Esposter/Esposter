import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "@/models/clicker/data/effect/Effect";
import { EffectType } from "@/models/clicker/data/effect/EffectType";
import { applyAdditiveEffects } from "@/services/clicker/effect/applyAdditiveEffects";
import { applyBuildingAdditiveEffects } from "@/services/clicker/effect/applyBuildingAdditiveEffects";
import { applyBuildingAdditiveNorEffects } from "@/services/clicker/effect/applyBuildingAdditiveNorEffects";
import { applyMultiplicativeEffects } from "@/services/clicker/effect/applyMultiplicativeEffects";

export const EffectOperatorMap = {
  [EffectType.Additive]: applyAdditiveEffects,
  [EffectType.Multiplicative]: applyMultiplicativeEffects,
  [EffectType.BuildingAdditive]: applyBuildingAdditiveEffects,
  [EffectType.BuildingAdditiveNor]: applyBuildingAdditiveNorEffects,
} as const satisfies Record<
  EffectType,
  (basePower: number, effects: Effect[], boughtBuildings: BuildingWithStats[]) => number
>;

import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { EffectOperatorMap } from "@/services/clicker/effect/EffectOperatorMap";

export const applyEffects = (basePower: number, allEffects: Effect[], boughtBuildings: BuildingWithStats[]) => {
  let resultPower = basePower;
  for (const effectType of Object.values(EffectType))
    resultPower = EffectOperatorMap[effectType](
      resultPower,
      allEffects.filter((e) => e.configuration.type === effectType),
      boughtBuildings,
    );
  return resultPower;
};

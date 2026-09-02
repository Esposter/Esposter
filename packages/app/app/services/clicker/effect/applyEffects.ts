import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { EffectTypes } from "#shared/models/clicker/data/effect/EffectType";
import { EffectOperatorMap } from "@/services/clicker/effect/EffectOperatorMap";

export const applyEffects = (basePower: number, allEffects: Effect[], boughtBuildings: BuildingWithStatistics[]) => {
  let resultPower = basePower;
  for (const effectType of EffectTypes)
    resultPower = EffectOperatorMap[effectType](
      resultPower,
      allEffects.filter(({ configuration }) => configuration.type === effectType),
      boughtBuildings,
    );
  return resultPower;
};

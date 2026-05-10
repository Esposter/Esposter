import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { EffectTypes } from "#shared/models/clicker/data/effect/EffectType";
import { EffectOperatorMap } from "@/services/clicker/effect/EffectOperatorMap";

export const applyEffects = (basePower: number, allEffects: Effect[], boughtBuildings: BuildingWithStats[]) => {
  let resultPower = basePower;
  for (const effectType of EffectTypes)
    resultPower = EffectOperatorMap[effectType](
      resultPower,
      allEffects.filter(({ configuration }) => configuration.type === effectType),
      boughtBuildings,
    );
  return resultPower;
};

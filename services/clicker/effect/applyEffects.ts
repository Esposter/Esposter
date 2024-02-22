import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import type { Effect } from "@/models/clicker/Effect";
import { EffectType } from "@/models/clicker/EffectType";
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

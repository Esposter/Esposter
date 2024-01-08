import { type BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { type Effect } from "@/models/clicker/Effect";

export const applyAdditiveEffects = (basePower: number, additiveEffects: Effect[], _: BuildingWithStats[]) => {
  let resultPower = basePower;
  for (const additiveEffect of additiveEffects) resultPower += additiveEffect.value;
  return resultPower;
};

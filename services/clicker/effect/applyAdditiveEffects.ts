import type { Effect } from "@/models/clicker/Effect";

export const applyAdditiveEffects = (basePower: number, additiveEffects: Effect[]) => {
  let resultPower = basePower;
  for (const additiveEffect of additiveEffects) resultPower += additiveEffect.value;
  return resultPower;
};

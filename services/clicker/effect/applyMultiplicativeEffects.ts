import type { Effect } from "@/models/clicker/Effect";

export const applyMultiplicativeEffects = (basePower: number, multiplicativeEffects: Effect[]) => {
  let resultPower = basePower;
  for (const multiplicativeEffect of multiplicativeEffects) resultPower *= multiplicativeEffect.value;
  return resultPower;
};

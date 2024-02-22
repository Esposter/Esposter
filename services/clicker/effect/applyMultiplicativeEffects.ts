import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import type { Effect } from "@/models/clicker/Effect";

export const applyMultiplicativeEffects = (
  basePower: number,
  multiplicativeEffects: Effect[],
  _: BuildingWithStats[],
) => {
  let resultPower = basePower;
  for (const multiplicativeEffect of multiplicativeEffects) resultPower *= multiplicativeEffect.value;
  return resultPower;
};

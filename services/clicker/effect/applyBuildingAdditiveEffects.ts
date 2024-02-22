import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import type { Effect } from "@/models/clicker/Effect";

export const applyBuildingAdditiveEffects = (
  basePower: number,
  buildingAdditiveEffects: Effect[],
  boughtBuildings: BuildingWithStats[],
) => {
  let resultPower = basePower;

  for (const buildingAdditiveEffect of buildingAdditiveEffects)
    for (const target of buildingAdditiveEffect.configuration.targets ?? []) {
      const foundBuilding = boughtBuildings.find((b) => b.name === target);
      if (!foundBuilding) break;

      resultPower += buildingAdditiveEffect.value * foundBuilding.amount;
    }

  return resultPower;
};

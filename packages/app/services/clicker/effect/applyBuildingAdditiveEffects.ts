import type { Effect } from "@/models/clicker/data/effect/Effect";
import type { BuildingWithStats } from "@/shared/models/clicker/data/building/BuildingWithStats";

export const applyBuildingAdditiveEffects = (
  basePower: number,
  buildingAdditiveEffects: Effect[],
  boughtBuildings: BuildingWithStats[],
) => {
  let resultPower = basePower;

  for (const buildingAdditiveEffect of buildingAdditiveEffects)
    for (const target of buildingAdditiveEffect.configuration.targets ?? []) {
      const foundBuilding = boughtBuildings.find((b) => b.id === target);
      if (!foundBuilding) break;

      resultPower += buildingAdditiveEffect.value * foundBuilding.amount;
    }

  return resultPower;
};

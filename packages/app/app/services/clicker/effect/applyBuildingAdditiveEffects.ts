import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

export const applyBuildingAdditiveEffects = (
  basePower: number,
  buildingAdditiveEffects: Effect[],
  boughtBuildings: BuildingWithStatistics[],
) => {
  let resultPower = basePower;

  for (const buildingAdditiveEffect of buildingAdditiveEffects)
    for (const target of buildingAdditiveEffect.configuration.targets ?? []) {
      const foundBuilding = boughtBuildings.find(({ id }) => id === target);
      if (!foundBuilding) break;

      resultPower += buildingAdditiveEffect.value * foundBuilding.amount;
    }

  return resultPower;
};

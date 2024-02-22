import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import type { Effect } from "@/models/clicker/Effect";

export const applyBuildingAdditiveNorEffects = (
  basePower: number,
  buildingAdditiveNorEffects: Effect[],
  boughtBuildings: BuildingWithStats[],
) => {
  let resultPower = basePower;

  for (const buildingAdditiveNorEffect of buildingAdditiveNorEffects) {
    const targets = buildingAdditiveNorEffect.configuration.targets ?? [];

    for (const boughtBuilding of boughtBuildings)
      if (!targets.includes(boughtBuilding.name))
        resultPower += buildingAdditiveNorEffect.value * boughtBuilding.amount;
  }

  return resultPower;
};

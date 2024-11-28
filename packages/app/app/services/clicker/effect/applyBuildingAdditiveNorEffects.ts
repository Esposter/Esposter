import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

export const applyBuildingAdditiveNorEffects = (
  basePower: number,
  buildingAdditiveNorEffects: Effect[],
  boughtBuildings: BuildingWithStats[],
) => {
  let resultPower = basePower;

  for (const buildingAdditiveNorEffect of buildingAdditiveNorEffects) {
    const targets = buildingAdditiveNorEffect.configuration.targets ?? [];

    for (const boughtBuilding of boughtBuildings)
      if (!targets.includes(boughtBuilding.id)) resultPower += buildingAdditiveNorEffect.value * boughtBuilding.amount;
  }

  return resultPower;
};

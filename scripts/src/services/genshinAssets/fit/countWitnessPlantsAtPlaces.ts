import type { FittedPlant } from "#src/models/genshinAssets/fit/FittedPlant";
import type { SceneLayout } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";

// The witness's plant meshes that stand at a place the record holds, read by their ground position. The witness lays
// Each plant's mesh where its prefab stands, so the count shows how far the record agrees with the layout it was fitted
// From.
export const countWitnessPlantsAtPlaces = (
  placements: SceneLayout["placements"],
  plants: readonly FittedPlant[],
): { matched: number; total: number } => {
  const placeKeys = new Set(plants.flatMap(({ places }) => places.map(({ position: { x, z } }) => `${x},${z}`)));
  const witnessPlants = placements.filter(({ mesh }) => checkIsPlantName(mesh));
  const matched = witnessPlants.filter(({ position: [x, , z] }) =>
    placeKeys.has(`${roundFitted(x)},${roundFitted(z)}`),
  ).length;
  return { matched, total: witnessPlants.length };
};

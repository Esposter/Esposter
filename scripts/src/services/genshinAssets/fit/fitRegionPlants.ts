import type { FittedPlant } from "#src/models/genshinAssets/fit/FittedPlant";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { SceneLayout } from "genshin-engine";

import { readPlantPlacements } from "#src/services/genshinAssets/fit/readPlantPlacements";
import { readWitnessPlacements } from "#src/services/genshinAssets/fit/readWitnessPlacements";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";
import { GameDataset } from "genshin-world";

// A component's plants as stand-ins: each prefab's places in our region's axes round the origin with their scales
export const toFittedPlants = (
  plants: readonly { name: string; places: readonly WorldPlacement[] }[],
  origin: [number, number, number],
): FittedPlant[] =>
  plants.map(({ name, places }) => ({
    name,
    places: places.map(({ position, rotation, scale: [scaleX, scaleY, scaleZ] }) => ({
      ...toRegionPlace({ position, rotation: toWorldQuaternion(rotation) }, origin),
      scale: [roundFitted(scaleX), roundFitted(scaleY), roundFitted(scaleZ)],
    })),
  }));

// The plants of one component, fitted from its streams by `readPlantPlacements`
export const fitRegionPlants = async (component: DerivedAssetComponent): Promise<{ plants: FittedPlant[] }> => {
  const { origin, plants } = await readPlantPlacements(component);
  return { plants: toFittedPlants(plants, origin) };
};

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

// A region's plants fit, published as the region's own record, `regions/<region>/plants`, with its count and the
// Witness's agreement with it.
export const createRegionPlantsFit = (region: DerivedAssetComponent) => async (): Promise<GameDataBuild> => {
  const [{ plants }, witness] = await Promise.all([fitRegionPlants(region), readWitnessPlacements(region)]);
  const places = plants.reduce((sum, { places: prefabPlaces }) => sum + prefabPlaces.length, 0);
  const { matched, total } = countWitnessPlantsAtPlaces(witness, plants);
  return {
    notes: [`${region} plants: ${plants.length} prefabs, ${places} places, ${matched}/${total} witness meshes at one`],
    objects: { [`${GameDataset.Regions}/${region}/plants`]: { plants } },
  };
};

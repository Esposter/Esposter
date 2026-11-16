import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { countWitnessPlantsAtPlaces } from "#src/services/genshinAssets/fit/countWitnessPlantsAtPlaces";
import { fitRegionPlants } from "#src/services/genshinAssets/fit/fitRegionPlants";
import { readWitnessPlacements } from "#src/services/genshinAssets/fit/readWitnessPlacements";
import { GameDataset } from "genshin-world";

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

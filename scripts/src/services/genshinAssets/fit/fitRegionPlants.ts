import type { FittedPlant } from "#src/models/genshinAssets/fit/FittedPlant";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { toFittedPlants } from "#src/services/genshinAssets/fit/toFittedPlants";
import { readPlantPlacements } from "#src/services/genshinAssets/shared/readPlantPlacements";

// The plants of one component, fitted from its streams by `readPlantPlacements`
export const fitRegionPlants = async (component: DerivedAssetComponent): Promise<{ plants: FittedPlant[] }> => {
  const { origin, plants } = await readPlantPlacements(component);
  return { plants: toFittedPlants(plants, origin) };
};

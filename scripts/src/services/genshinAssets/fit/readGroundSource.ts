import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { CityArea } from "#src/models/genshinAssets/world/CityArea";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readRegionLandmarks } from "#src/services/genshinAssets/fit/readRegionLandmarks";
import { readCityAreas } from "#src/services/genshinAssets/world/readCityAreas";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";

// A region's ground source, read together so every piece and quarter of the region fits from the one read
export const readGroundSource = async (region: DerivedAssetComponent): Promise<GroundSource> => {
  const [getGameHeight, origin, landmarks] = await Promise.all([
    readWorldTerrainHeight(region),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readRegionLandmarks(),
  ]);
  let cityAreas: Promise<CityArea[]> | undefined;
  return { getCityAreas: () => (cityAreas ??= readCityAreas()), getGameHeight, landmarks, origin };
};

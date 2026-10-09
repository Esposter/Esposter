import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { readCityAreas } from "#src/services/genshinAssets/world/readCityAreas";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The code of a capital's city area (its `Area_<code>_City` blob): the one its region map names, or else the area its
// Place selects. "" where neither holds
export const readCapitalCityCode = async (component: DerivedAssetComponent): Promise<string> => {
  const capital = RegionCapitalMap[component];
  if (!capital) throw new InvalidOperationError(Operation.Read, component, "has no capital in the region capital map");
  if (capital.cityArea) return capital.cityArea;
  return selectCapitalCityArea(await readCityAreas(), await readCapitalWorldPlace(component))?.code ?? "";
};

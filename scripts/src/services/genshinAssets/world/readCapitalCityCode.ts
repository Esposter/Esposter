import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { readCityAreas } from "#src/services/genshinAssets/world/readCityAreas";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";

// The code of a capital's city area (its `Area_<code>_City` blob): the area its place selects among the ones
// `city-areas` cached for the installed game. "" where none stands near it
export const readCapitalCityCode = async (component: DerivedAssetComponent): Promise<string> =>
  selectCapitalCityArea(await readCityAreas(), await readCapitalWorldPlace(component))?.code ?? "";

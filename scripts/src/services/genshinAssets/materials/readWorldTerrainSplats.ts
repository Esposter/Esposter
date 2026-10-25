import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { readTerrainSplats } from "#src/services/genshinAssets/world/readTerrainSplats";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";

// A component with no world of its own has no terrain tiles to read layers off
export const readWorldTerrainSplats = async (component: DerivedAssetComponent): ReturnType<typeof readTerrainSplats> =>
  (await readWorldOptions(component)) ? readTerrainSplats(component) : [];

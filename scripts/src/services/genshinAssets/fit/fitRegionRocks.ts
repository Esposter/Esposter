import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { checkIsRockMesh } from "#src/services/genshinAssets/fit/checkIsRockMesh";
import { createRegionHullsFit } from "#src/services/genshinAssets/fit/createRegionHullsFit";

// A region's rocks fit, published as the region's own record, `regions/<region>/rocks`, beside its plants
export const createRegionRocksFit = (region: DerivedAssetComponent): (() => Promise<GameDataBuild>) =>
  createRegionHullsFit(region, "rocks", checkIsRockMesh);

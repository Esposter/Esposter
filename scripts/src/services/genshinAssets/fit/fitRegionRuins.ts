import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { checkIsRuinMesh } from "#src/services/genshinAssets/fit/checkIsRuinMesh";
import { createRegionHullsFit } from "#src/services/genshinAssets/fit/createRegionHullsFit";

// A region's ruins fit, published as the region's own record, `regions/<region>/ruins`, beside its rocks. The four-kind
// Desert ruin model and its generator are the record's consumer's to replace, in the Sumeru change
export const createRegionRuinsFit = (region: DerivedAssetComponent): (() => Promise<GameDataBuild>) =>
  createRegionHullsFit(region, "ruins", checkIsRuinMesh);

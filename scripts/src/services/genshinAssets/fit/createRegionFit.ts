import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { readRegionGroundFits } from "#src/services/genshinAssets/fit/readRegionGroundFits";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// A region's fit: its ground pieces, and the fits it has beside them, such as its waterfalls
export const createRegionFit =
  (
    region: DerivedAssetComponent,
    extraFits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>> = {},
  ): DerivedAssetFit =>
  async (only, options) =>
    runFits({ ...(await readRegionGroundFits(region)), ...extraFits }, only, options);

import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { readRegionGroundFits } from "#src/services/genshinAssets/fit/readRegionGroundFits";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { takeOne } from "@esposter/shared";

// A region's fit: its ground pieces, and the fits it has beside them, such as its waterfalls
export const createRegionFit =
  (
    region: DerivedAssetComponent,
    extraFits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>> = {},
  ): DerivedAssetFit =>
  async (only, options) => {
    const fits = { ...(await readRegionGroundFits(region)), ...extraFits };
    return runFits(
      Object.keys(fits).map((name) => [name, takeOne(fits, name)] as const),
      only,
      options,
    );
  };

import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readGroundPieceAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { readRegionGroundFits } from "#src/services/genshinAssets/fit/readRegionGroundFits";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { selectRetiredGroundKeys } from "#src/services/genshinAssets/fit/selectRetiredGroundKeys";

// A region's fit: its ground pieces, and the fits it has beside them, such as its waterfalls. A publish that stores the
// Region's pieces retires its plateau in the same step, once the lock holds a piece of every outlined area
export const createRegionFit =
  (
    region: DerivedAssetComponent,
    extraFits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>> = {},
  ): DerivedAssetFit =>
  async (only, options) => {
    const fits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>> = {
      ...(await readRegionGroundFits(region)),
      ...extraFits,
    };
    const { notes, objects } = await runFits(Object.entries(fits), only, options);
    const retired = selectRetiredGroundKeys({
      areaIds: (await readGroundPieceAreas(region)).map(({ id }) => id),
      lockKeys: Object.keys((await readGameDataLock()).objects),
      publishedKeys: Object.keys(objects),
      region,
    });
    return { notes, objects, retired };
  };

import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRegionGround } from "#src/services/genshinAssets/fit/fitRegionGround";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// A fit's records, given the names of the fits to run (none, for all) and whether it is a dry run, which writes no
// Region data file and publishes nothing
type DerivedAssetFit = (only: readonly string[], { isDryRun }: { isDryRun: boolean }) => Promise<GameDataBuild>;

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry. A region's centre is
// Its capital's landmark in its region data, in the same axes its ground is fitted in
export const DerivedAssetFitMap: Partial<Record<DerivedAssetComponent, DerivedAssetFit>> = {
  [DerivedAssetComponent.Fontaine]: (only = []) =>
    runFits({ ground: () => fitRegionGround(DerivedAssetComponent.Fontaine, { x: 1554.31, z: -5721.47 }) }, only),
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Inazuma]: (only, { isDryRun }) =>
    runFits(
      {
        ground: () => fitRegionGround(DerivedAssetComponent.Inazuma, { x: -4942.86, z: 3135.69 }),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Inazuma, { isDryRun }),
      },
      only,
    ),
  [DerivedAssetComponent.Liyue]: (only, { isDryRun }) =>
    runFits(
      {
        ground: () => fitRegionGround(DerivedAssetComponent.Liyue, { x: -2392.4, z: -1562.44 }),
        rivers: () => fitRiverCourses(DerivedAssetComponent.Liyue, { isDryRun }),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Liyue, { isDryRun }),
      },
      only,
    ),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: (only, { isDryRun }) =>
    runFits(
      {
        ground: () => fitRegionGround(DerivedAssetComponent.Mondstadt, { x: 391.51, z: -517.41 }),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Mondstadt, { isDryRun }),
      },
      only,
    ),
  [DerivedAssetComponent.Natlan]: (only, { isDryRun }) =>
    runFits(
      {
        ground: () => fitRegionGround(DerivedAssetComponent.Natlan, { x: -4568.99, z: -10185.85 }),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Natlan, { isDryRun }),
      },
      only,
    ),
  [DerivedAssetComponent.NodKrai]: (only = []) =>
    runFits({ ground: () => fitRegionGround(DerivedAssetComponent.NodKrai, { x: -252.53, z: -10724.89 }) }, only),
  [DerivedAssetComponent.Snezhnaya]: (only = []) =>
    runFits({ ground: () => fitRegionGround(DerivedAssetComponent.Snezhnaya, { x: 3750, z: -10730 }) }, only),
  [DerivedAssetComponent.Sumeru]: (only, { isDryRun }) =>
    runFits(
      {
        ground: () => fitRegionGround(DerivedAssetComponent.Sumeru, { x: -2306.31, z: -4053.85 }),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Sumeru, { isDryRun }),
      },
      only,
    ),
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};

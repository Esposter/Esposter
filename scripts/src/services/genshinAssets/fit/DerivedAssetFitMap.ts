import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readRegionAreas";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// A region's ground in pieces, one fit per area its catalogue outlines, each named `ground/<area>` so `--only ground`
// Runs them all and `--only ground/<area>` runs one. The Region is fitted once, whichever area is asked for, and an
// Area's piece publishes only when the whole region qualifies
const readRegionGroundFits = async (
  region: DerivedAssetComponent,
): Promise<Record<string, () => Promise<GameDataBuild>>> => {
  const areas = await readRegionAreas(region);
  let fitted: Promise<RegionGroundFit> | undefined;
  const fitRegion = (): Promise<RegionGroundFit> => (fitted ??= fitRegionGroundPieces(region, areas));
  return Object.fromEntries(
    areas
      .filter((area) => checkHasOutline(area))
      .map(({ id }) => [
        `ground/${id}`,
        async () => {
          const fit = await fitRegion();
          const build = fit.pieces.find(({ areaId }) => areaId === id)?.build ?? { notes: [], objects: {} };
          return fit.isQualified
            ? build
            : {
                notes: [...build.notes, `${region}: keeps its plateau and lays no pieces, ${fit.reason}`],
                objects: {},
              };
        },
      ]),
  );
};

// A fit's records, given the names of the fits to run (none, for all) and whether it is a dry run, which writes no
// Region data file and publishes nothing
type DerivedAssetFit = (only: readonly string[], options: DryRunOptions) => Promise<GameDataBuild>;

// A region's fit: its ground pieces, and the fits it has beside them, such as its waterfalls
const createRegionFit =
  (
    region: DerivedAssetComponent,
    extraFits: Record<string, (options: DryRunOptions) => Promise<GameDataBuild>> = {},
  ): DerivedAssetFit =>
  async (only, options) =>
    runFits({ ...(await readRegionGroundFits(region)), ...extraFits }, only, options);

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<Record<DerivedAssetComponent, DerivedAssetFit>> = {
  [DerivedAssetComponent.Fontaine]: createRegionFit(DerivedAssetComponent.Fontaine),
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Inazuma]: createRegionFit(DerivedAssetComponent.Inazuma, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Inazuma, fitOptions),
  }),
  [DerivedAssetComponent.Liyue]: createRegionFit(DerivedAssetComponent.Liyue, {
    rivers: (fitOptions) => fitRiverCourses(DerivedAssetComponent.Liyue, fitOptions),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Liyue, fitOptions),
  }),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: createRegionFit(DerivedAssetComponent.Mondstadt, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Mondstadt, fitOptions),
  }),
  [DerivedAssetComponent.Natlan]: createRegionFit(DerivedAssetComponent.Natlan, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Natlan, fitOptions),
  }),
  [DerivedAssetComponent.NodKrai]: createRegionFit(DerivedAssetComponent.NodKrai),
  [DerivedAssetComponent.Snezhnaya]: createRegionFit(DerivedAssetComponent.Snezhnaya),
  [DerivedAssetComponent.Sumeru]: createRegionFit(DerivedAssetComponent.Sumeru, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Sumeru, fitOptions),
  }),
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};

import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { RegionGroundFit } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";
import { readGroundPieceAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// A region's ground in pieces, one fit per area its catalogue outlines, each named by its area so `--only` runs one. The
// Region is fitted once, whichever area is asked for, and an area's piece publishes only when the whole region qualifies
const readRegionGroundFits = async (
  region: DerivedAssetComponent,
): Promise<Record<string, () => Promise<GameDataBuild>>> => {
  let fitted: Promise<RegionGroundFit> | undefined;
  const fitRegion = (): Promise<RegionGroundFit> => (fitted ??= fitRegionGroundPieces(region));
  return Object.fromEntries(
    (await readGroundPieceAreas(region)).map(({ id }) => [
      id,
      async () => {
        const fit = await fitRegion();
        const build = fit.pieces.find(({ areaId }) => areaId === id)?.build ?? { notes: [], objects: {} };
        return fit.isQualified
          ? build
          : { notes: [...build.notes, `${region}: keeps its plateau and lays no pieces, ${fit.reason}`], objects: {} };
      },
    ]),
  );
};

// A fit's records, given the names of the fits to run (none, for all) and whether it is a dry run, which writes no
// Region data file and publishes nothing
type DerivedAssetFit = (only: readonly string[], options: { isDryRun: boolean }) => Promise<GameDataBuild>;

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<Record<DerivedAssetComponent, DerivedAssetFit>> = {
  [DerivedAssetComponent.Fontaine]: async (only, options) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Fontaine), only, options),
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Inazuma]: async (only, options) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Inazuma)),
        waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Inazuma, fitOptions),
      },
      only,
      options,
    ),
  [DerivedAssetComponent.Liyue]: async (only, options) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Liyue)),
        rivers: (fitOptions) => fitRiverCourses(DerivedAssetComponent.Liyue, fitOptions),
        waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Liyue, fitOptions),
      },
      only,
      options,
    ),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: async (only, options) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Mondstadt)),
        waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Mondstadt, fitOptions),
      },
      only,
      options,
    ),
  [DerivedAssetComponent.Natlan]: async (only, options) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Natlan)),
        waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Natlan, fitOptions),
      },
      only,
      options,
    ),
  [DerivedAssetComponent.NodKrai]: async (only, options) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.NodKrai), only, options),
  [DerivedAssetComponent.Snezhnaya]: async (only, options) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Snezhnaya), only, options),
  [DerivedAssetComponent.Sumeru]: async (only, options) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Sumeru)),
        waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Sumeru, fitOptions),
      },
      only,
      options,
    ),
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};

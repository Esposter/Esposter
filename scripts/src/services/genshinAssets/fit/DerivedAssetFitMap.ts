import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { RegionGroundFit } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
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

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<
  Record<DerivedAssetComponent, (only?: readonly string[]) => Promise<GameDataBuild>>
> = {
  [DerivedAssetComponent.Fontaine]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Fontaine), only),
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Inazuma]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Inazuma), only),
  [DerivedAssetComponent.Liyue]: async (only = []) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Liyue)),
        rivers: () => fitRiverCourses(DerivedAssetComponent.Liyue),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Liyue),
      },
      only,
    ),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: async (only = []) =>
    runFits(
      {
        ...(await readRegionGroundFits(DerivedAssetComponent.Mondstadt)),
        waterfalls: () => fitWaterfallSheets(DerivedAssetComponent.Mondstadt),
      },
      only,
    ),
  [DerivedAssetComponent.Natlan]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Natlan), only),
  [DerivedAssetComponent.NodKrai]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.NodKrai), only),
  [DerivedAssetComponent.Snezhnaya]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Snezhnaya), only),
  [DerivedAssetComponent.Sumeru]: async (only = []) =>
    runFits(await readRegionGroundFits(DerivedAssetComponent.Sumeru), only),
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};

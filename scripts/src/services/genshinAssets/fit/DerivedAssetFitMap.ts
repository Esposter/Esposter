import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";
import { readGroundPieceAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { toGroundPiece } from "#src/services/genshinAssets/fit/toGroundPiece";

// A region's ground in pieces, one fit per area its catalogue outlines, each named by its area so `--only` runs one
const readRegionGroundFits = async (
  region: DerivedAssetComponent,
): Promise<Record<string, () => Promise<GameDataBuild>>> =>
  Object.fromEntries(
    (await readGroundPieceAreas(region)).map((area) => [
      area.id,
      () => fitGroundPieces(region, toGroundPiece(region, area), true),
    ]),
  );

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

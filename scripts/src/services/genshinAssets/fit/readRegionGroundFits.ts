import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
import { readGroundPieceAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { readGroundSource } from "#src/services/genshinAssets/fit/readGroundSource";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readRegionAreas";
import { readWorldBaseGrounds } from "#src/services/genshinAssets/shared/readWorldBaseGrounds";
import { GameDataset } from "genshin-world";

// Windrise's base as the lock holds it, which a region's composed bars are read over
const readBaseGrounds = async () => readWorldBaseGrounds(Object.keys((await readGameDataLock()).objects));

// A region's ground in pieces, one fit per surface area its catalogue outlines, each named `ground/<area>` so
// `--only ground` runs them all and `--only ground/<area>` runs one. The Region is fitted once, whichever area is asked
// For, and an area's piece publishes only when the whole region qualifies
export const readRegionGroundFits = async (
  region: DerivedAssetComponent,
): Promise<Record<string, () => Promise<GameDataBuild>>> => {
  const areas = await readRegionAreas(region);
  let fitted: Promise<RegionGroundFit> | undefined;
  const fitRegion = (): Promise<RegionGroundFit> =>
    (fitted ??= fitRegionGroundPieces(region, areas, readGroundSource(region), readBaseGrounds));
  return Object.fromEntries(
    (await readGroundPieceAreas(region)).map(({ id }) => [
      `${GameDataset.Ground}/${id}`,
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

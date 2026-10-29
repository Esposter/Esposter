import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readRegionAreas";
import { GameDataset } from "genshin-world";

// A region's ground in pieces, one fit per area its catalogue outlines, each named `ground/<area>` so `--only ground`
// Runs them all and `--only ground/<area>` runs one. The Region is fitted once, whichever area is asked for, and an
// Area's piece publishes only when the whole region qualifies
export const readRegionGroundFits = async (
  region: DerivedAssetComponent,
): Promise<Record<string, () => Promise<GameDataBuild>>> => {
  const areas = await readRegionAreas(region);
  let fitted: Promise<RegionGroundFit> | undefined;
  const fitRegion = (): Promise<RegionGroundFit> => (fitted ??= fitRegionGroundPieces(region, areas));
  return Object.fromEntries(
    areas
      .filter((area) => checkHasOutline(area))
      .map(({ id }) => [
        `${GameDataset.Ground}/${id}`,
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

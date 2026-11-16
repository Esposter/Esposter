import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { fitRegionHulls } from "#src/services/genshinAssets/fit/fitRegionHulls";
import { GameDataset } from "genshin-world";

// A region's hulls fit for one kind of object, published as the region's own record, `regions/<region>/<kind>`, which
// Names the kind in its note too
export const createRegionHullsFit =
  (region: DerivedAssetComponent, kind: string, checkIsHullMesh: (mesh: string) => boolean) =>
  async (): Promise<GameDataBuild> => {
    const { hulls, placements } = await fitRegionHulls(region, checkIsHullMesh);
    const boxes = Object.values(hulls).reduce((sum, hull) => sum + hull.length, 0);
    return {
      notes: [`${region} ${kind}: ${Object.keys(hulls).length} hulls, ${boxes} boxes, ${placements.length} places`],
      objects: { [`${GameDataset.Regions}/${region}/${kind}`]: { hulls, placements } },
    };
  };

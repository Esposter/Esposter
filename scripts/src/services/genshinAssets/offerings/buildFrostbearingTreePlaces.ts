import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { FROSTBEARING_TREE_LABEL_ID } from "#src/services/genshinAssets/offerings/constants";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset } from "genshin-world";

// The Frostbearing Tree's place in each region, from the official map's point and the fit, as one slice of its dataset
// Per region. The notes count each region's trees and what was left out
export const buildFrostbearingTreePlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const placement = placeMapPoints(
    points,
    transform,
    new Map([[FROSTBEARING_TREE_LABEL_ID, "FrostbearingTree"]]),
    "tree",
    origin,
  );
  return buildMapPointSlices(GameDataset.FrostbearingTreePlaces, placement, "Frostbearing Tree");
};

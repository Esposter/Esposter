import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { FROSTBEARING_TREE_LABEL_ID } from "#src/services/genshinAssets/offerings/constants";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { GameDataset } from "genshin-world";

// The Frostbearing Tree's place in each region, from the official map's point and the fit, as one slice of its dataset
// Per region. The notes count each region's trees and what was left out
export const buildFrostbearingTreePlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.FrostbearingTreePlaces,
    new Map([[FROSTBEARING_TREE_LABEL_ID, "FrostbearingTree"]]),
    "tree",
    "Frostbearing Tree",
  );

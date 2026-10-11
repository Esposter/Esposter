import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { FROSTBEARING_TREE_LABEL_ID } from "#src/services/genshinAssets/offerings/constants";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { GameDataset } from "genshin-world";

// The Frostbearing Tree's place in each region, from the official map's point and the fit, as one slice of its dataset
// Per region. The notes count each region's trees and what was left out
export const buildFrostbearingTreePlaces = async (): Promise<GameDataBuild> => {
  const placement = await placeFittedMapPoints(new Map([[FROSTBEARING_TREE_LABEL_ID, "FrostbearingTree"]]), "tree");
  return buildMapPointSlices(GameDataset.FrostbearingTreePlaces, placement, "Frostbearing Tree");
};

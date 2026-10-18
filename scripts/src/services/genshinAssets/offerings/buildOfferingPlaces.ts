import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { LabelIdOfferingKindMap } from "#src/services/genshinAssets/offerings/LabelIdOfferingKindMap";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { GameDataset } from "genshin-world";

// Each region's offerings' places beside the Frostbearing Tree's, as one slice per region of the offering places dataset.
// Each place carries its offering's kind, the key its levels are published under. The tree keeps its own dataset
export const buildOfferingPlaces = async (): Promise<GameDataBuild> => {
  const placement = await placeFittedMapPoints(LabelIdOfferingKindMap, "offering");
  return buildMapPointSlices(GameDataset.OfferingPlaces, placement, "offering places");
};

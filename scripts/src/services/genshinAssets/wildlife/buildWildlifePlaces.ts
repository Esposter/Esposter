import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { WildlifeKindLabelIdMap } from "#src/services/genshinAssets/wildlife/WildlifeKindLabelIdMap";
import { GameDataset, WildlifeKind } from "genshin-world";

// Each region's animals of the kinds the map marks as birds and beasts, as one slice of the wildlife dataset, from the
// Official map's points and the fit. The notes count each region's animals and what was left out
export const buildWildlifePlaces = async (): Promise<GameDataBuild> => {
  const labelIdKindMap = new Map(Object.values(WildlifeKind).map((kind) => [WildlifeKindLabelIdMap[kind], kind]));
  const placement = await placeFittedMapPoints(labelIdKindMap, "wildlife");
  return buildMapPointSlices(GameDataset.Wildlife, placement, "animals");
};

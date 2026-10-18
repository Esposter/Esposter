import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { WildlifeKindLabelIdMap } from "#src/services/genshinAssets/wildlife/WildlifeKindLabelIdMap";
import { GameDataset, WildlifeKind } from "genshin-world";

// Each region's animals of the kinds the map marks as birds and beasts, as one slice of the wildlife dataset, from the
// Official map's points and the fit. The notes count each region's animals and what was left out
export const buildWildlifePlaces = (): Promise<GameDataBuild> => {
  const labelIdKindMap = new Map(Object.values(WildlifeKind).map((kind) => [WildlifeKindLabelIdMap[kind], kind]));
  return buildFittedMapPointSlices(GameDataset.Wildlife, labelIdKindMap, "wildlife", "animals");
};

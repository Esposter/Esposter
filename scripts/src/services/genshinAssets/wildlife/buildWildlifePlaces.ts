import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { WildlifeKindLabelIdMap } from "#src/services/genshinAssets/wildlife/WildlifeKindLabelIdMap";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset, WildlifeKind } from "genshin-world";

// Each region's animals of the kinds the map marks as fleeing birds and beasts, as one slice of the wildlife dataset,
// From the official map's points and the fit. The notes count each region's animals and what was left out
export const buildWildlifePlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(WildlifeKind).map((kind) => [WildlifeKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "wildlife", origin);
  return buildMapPointSlices(GameDataset.Wildlife, placement, "animals");
};

import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ChestKindLabelIdMap } from "#src/services/genshinAssets/chests/ChestKindLabelIdMap";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { ChestKind, GameDataset } from "genshin-world";

// Each region's chests as one slice of the chests dataset, from the official map's points and the fit, each carried
// Into its region's axes round the Windrise origin as the region's landmarks are. The notes count each region's chests
// And what was left out
export const buildChestPlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(ChestKind).map((kind) => [ChestKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "chest", origin);
  return buildMapPointSlices(GameDataset.Chests, placement, "chests");
};

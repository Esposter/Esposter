import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { SceneGroups } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { toCraftingBenchPlaces } from "#src/services/genshinAssets/crafting/toCraftingBenchPlaces";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { toFittedMapPoints } from "#src/services/genshinAssets/residents/toFittedMapPoints";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";

export const buildCraftingBenchPlaces = async (): Promise<GameDataBuild> => {
  const [origin, fittedMapPoints, sceneGroups] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
    readPublishedGameData<SceneGroups>(SCENE_GROUPS_KEY),
  ]);
  const { regionMapPoints } = toFittedMapPoints(fittedMapPoints);
  return toCraftingBenchPlaces(sceneGroups, origin, regionMapPoints);
};

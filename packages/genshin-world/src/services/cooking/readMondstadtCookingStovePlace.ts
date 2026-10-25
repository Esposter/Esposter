import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { MONDSTADT_COOKING_STOVE_BUILDING_NAME } from "#src/services/cooking/constants";
import { getCookingStovePlace } from "#src/services/cooking/getCookingStovePlace";
import { readSceneGroups } from "#src/services/sceneGroup/readSceneGroups";

// Mondstadt's stove place, read from the hosted scene group record of its scene, or undefined where that record names
// No stove
export const readMondstadtCookingStovePlace = async (gameDataBaseUrl: string): Promise<SceneGroupPlace | undefined> =>
  getCookingStovePlace(await readSceneGroups(gameDataBaseUrl), MONDSTADT_COOKING_STOVE_BUILDING_NAME);

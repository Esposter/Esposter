import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { getBlacksmithPlace } from "#src/services/forging/getBlacksmithPlace";
import { readSceneGroups } from "#src/services/sceneGroup/readSceneGroups";

// Mondstadt's blacksmith place, read from the hosted scene group record of its scene, or undefined where that record
// Names no such point
export const readMondstadtBlacksmithPlace = async (gameDataBaseUrl: string): Promise<SceneGroupPlace | undefined> =>
  getBlacksmithPlace(await readSceneGroups(gameDataBaseUrl));

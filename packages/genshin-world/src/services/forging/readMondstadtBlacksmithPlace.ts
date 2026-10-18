import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { sceneGroupsSchema } from "#src/models/sceneGroup/SceneGroups";
import { readGameData } from "#src/services/data/readGameData";
import { getBlacksmithPlace } from "#src/services/forging/getBlacksmithPlace";

// Mondstadt's blacksmith place, read from the hosted scene group record of its scene, or undefined where that record
// Names no such point
export const readMondstadtBlacksmithPlace = async (gameDataBaseUrl: string): Promise<SceneGroupPlace | undefined> =>
  getBlacksmithPlace(await readGameData(gameDataBaseUrl, "sceneGroups/scene3", sceneGroupsSchema));

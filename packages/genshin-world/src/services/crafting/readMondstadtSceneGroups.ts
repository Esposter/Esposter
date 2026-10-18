import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { sceneGroupsSchema } from "#src/models/sceneGroup/SceneGroups";
import { readGameData } from "#src/services/data/readGameData";

// Mondstadt's scene group record, `sceneGroups/scene3`, fetched by its key from the hosted game data as the world opens
// And checked against its schema as it arrives
export const readMondstadtSceneGroups = (gameDataBaseUrl: string): Promise<SceneGroups> =>
  readGameData(gameDataBaseUrl, "sceneGroups/scene3", sceneGroupsSchema);

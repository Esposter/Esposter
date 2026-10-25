import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { sceneGroupsSchema } from "#src/models/sceneGroup/SceneGroups";
import { readGameData } from "#src/services/data/readGameData";

// The open world's scene group record, read from the hosted game data, which holds the places the cooking stove, the
// Blacksmith and the viewpoints stand at
export const readSceneGroups = (gameDataBaseUrl: string): Promise<SceneGroups> =>
  readGameData(gameDataBaseUrl, "sceneGroups/scene3", sceneGroupsSchema);

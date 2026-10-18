import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { MONDSTADT_BLACKSMITH_POINT_ID } from "#src/services/forging/constants";

// Where Mondstadt's blacksmith stands: the place its scene group record gives the `Blacksmith` building point, or undefined
// Where the record holds no such point with a place
export const getBlacksmithPlace = (sceneGroups: SceneGroups): SceneGroupPlace | undefined =>
  sceneGroups.buildings[MONDSTADT_BLACKSMITH_POINT_ID]?.place;

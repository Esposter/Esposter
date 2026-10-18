import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

// Where a city's stove stands: the place of the building point its scene group record names with the stove's name, or
// Undefined where the record holds no such point
export const getCookingStovePlace = (sceneGroups: SceneGroups, buildingName: string): SceneGroupPlace | undefined =>
  Object.values(sceneGroups.buildings).find(({ name }) => name === buildingName)?.place;

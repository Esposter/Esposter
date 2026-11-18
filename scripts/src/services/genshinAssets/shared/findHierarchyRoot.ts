import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// The object at the top of the hierarchy `object` lies in: its parents are walked up through the layout's objects, each
// Keyed by its file and transform ID, until one has no parent the layout holds
export const findHierarchyRoot = (objectMap: ReadonlyMap<string, SceneObject>, object: SceneObject): SceneObject => {
  let current = object;
  for (let parent = objectMap.get(toObjectKey(current.parentFile, current.parentId)); parent;) {
    current = parent;
    parent = objectMap.get(toObjectKey(current.parentFile, current.parentId));
  }
  return current;
};

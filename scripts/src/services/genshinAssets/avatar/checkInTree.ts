import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// Whether an object lies under the root in the tree, the root itself included, by walking its parents up to the root
export const checkInTree = (
  object: SceneObject,
  rootKey: string,
  objectMap: ReadonlyMap<string, SceneObject>,
): boolean => {
  let current: SceneObject | undefined = object;
  while (current) {
    if (toObjectKey(current.file, current.transformId) === rootKey) return true;
    current = objectMap.get(toObjectKey(current.parentFile || current.file, current.parentId));
  }
  return false;
};

import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { groupSceneChildren } from "#src/services/genshinAssets/shared/groupSceneChildren";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// Collects an object and every object under it, its children's subtrees in turn, over the scene's objects as grouped now
export const createSubtreeCollector = (objects: readonly SceneObject[]): ((object: SceneObject) => SceneObject[]) => {
  const parentKeyChildrenMap = groupSceneChildren(objects);
  const collectSubtree = (object: SceneObject): SceneObject[] => [
    object,
    ...(parentKeyChildrenMap.get(toObjectKey(object.file, object.transformId)) ?? []).flatMap((child) =>
      collectSubtree(child),
    ),
  ];
  return collectSubtree;
};

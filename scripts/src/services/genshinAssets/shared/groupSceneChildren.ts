import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// Every object's children by its file and transform's path ID, read from the father each child names: a transform whose
// Game object was lost from the dump holds a stand-in ID no father's list of children names, but it still names its
// Father
export const groupSceneChildren = (objects: readonly SceneObject[]): Map<string, SceneObject[]> =>
  Map.groupBy(objects, ({ parentFile, parentId }) => toObjectKey(parentFile, parentId));

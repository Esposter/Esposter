import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";

// Every object's children by its file and transform's path ID, read from each child's own father: a transform whose
// Game object was lost from the dump holds a stand-in ID no father's list of children names, but it still names its
// Father
export const groupSceneChildren = (objects: readonly SceneObject[]): Map<string, SceneObject[]> =>
  Map.groupBy(objects, ({ file, parentId }) => toObjectKey(file, parentId));

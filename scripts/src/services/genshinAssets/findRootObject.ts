import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { basename } from "node:path";

// The object a root names, by its block and its game object's path ID: a layout folder is named after its block
// Without its folder or extension
export const findRootObject = (objects: readonly SceneObject[], root: AssetRoot): SceneObject | undefined => {
  const blockName = basename(root.block, ".blk");
  return objects.find(({ block, gameObjectId }) => block === blockName && gameObjectId === root.pathId);
};

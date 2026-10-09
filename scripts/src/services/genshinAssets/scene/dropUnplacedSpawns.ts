import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";
import type { SceneDrawing } from "#src/models/genshinAssets/shared/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { SceneTreeFlag } from "#src/models/genshinAssets/scene/SceneTreeFlag";
import { composeSceneTree } from "#src/services/genshinAssets/scene/composeSceneTree";

// The objects without the unplaced spawns: each top (a root, or an object whose father no dump holds) whose whole subtree
// Stands at the origin is a prefab a script spawns at run time, with no static placement to set it down by, so it is
// Dropped rather than drawn piled at the origin. The spawns `DerivedAssetComponentMap` attaches are placed before this runs
export const dropUnplacedSpawns = (
  objects: readonly SceneObject[],
  gameObjectDrawingMap: ReadonlyMap<string, SceneDrawing>,
): SceneObject[] => {
  const unplacedObjects = new Set<SceneObject>();
  const collectSubtree = (node: SceneTreeNode): void => {
    unplacedObjects.add(node.object);
    for (const child of node.children) collectSubtree(child);
  };
  for (const top of composeSceneTree(objects, gameObjectDrawingMap))
    if (top.flags.includes(SceneTreeFlag.TopAtOrigin)) collectSubtree(top);
  return objects.filter((object) => !unplacedObjects.has(object));
};

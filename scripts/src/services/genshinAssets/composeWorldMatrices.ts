import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { Matrix4, Quaternion, Vector3 } from "three";

// Every object's world matrix by its file and transform's path ID: its local transform composed with each parent's up
// To the highest one the dump holds, as Unity composes a Transform, whose parent is always in its own file
export const composeWorldMatrices = (objects: readonly SceneObject[]): Map<string, Matrix4> => {
  const keyObjectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const keyWorldMatrixMap = new Map<string, Matrix4>();
  const getWorldMatrix = (
    { file, parentId, position, rotation, scale, transformId }: SceneObject,
    visitedKeys: ReadonlySet<string>,
  ): Matrix4 => {
    const key = toObjectKey(file, transformId);
    const cached = keyWorldMatrixMap.get(key);
    if (cached) return cached;
    const local = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    const parentKey = toObjectKey(file, parentId);
    const parent = keyObjectMap.get(parentKey);
    // A chain that loops back on itself composes no further than where it closes
    const world =
      parent && !visitedKeys.has(parentKey)
        ? getWorldMatrix(parent, new Set([...visitedKeys, key]))
            .clone()
            .multiply(local)
        : local;
    keyWorldMatrixMap.set(key, world);
    return world;
  };
  for (const object of objects) getWorldMatrix(object, new Set());
  return keyWorldMatrixMap;
};

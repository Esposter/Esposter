import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { Matrix4, Quaternion, Vector3 } from "three";

// Every object's world matrix by its transform's path ID: its local transform composed with each parent's up to the
// Highest one the dump holds, as Unity composes a Transform
export const composeWorldMatrices = (objects: readonly SceneObject[]): Map<string, Matrix4> => {
  const idObjectMap = new Map(objects.map((object) => [object.transformId, object]));
  const idWorldMatrixMap = new Map<string, Matrix4>();
  const getWorldMatrix = (
    { parentId, position, rotation, scale, transformId }: SceneObject,
    visitedIds: ReadonlySet<string>,
  ): Matrix4 => {
    const cached = idWorldMatrixMap.get(transformId);
    if (cached) return cached;
    const local = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    const parent = idObjectMap.get(parentId);
    // A chain that loops back on itself composes no further than where it closes
    const world =
      parent && !visitedIds.has(parentId)
        ? getWorldMatrix(parent, new Set([...visitedIds, transformId]))
            .clone()
            .multiply(local)
        : local;
    idWorldMatrixMap.set(transformId, world);
    return world;
  };
  for (const object of objects) getWorldMatrix(object, new Set());
  return idWorldMatrixMap;
};

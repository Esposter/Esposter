import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { ROOT_PARENT_ID } from "#src/services/genshinAssets/constants";
import { Matrix4, Quaternion, Vector3 } from "three";

// Every object's world placement, its local transform composed with each parent's up to its root. An object whose
// Parent is outside the dump (a prefab's part, placed by an instance in a block not read) has no place of its own to
// Compose, so it is left out rather than set down at the world's origin
export const composeAssetPlacements = (
  objects: readonly SceneObject[],
  nameMeshMap: ReadonlyMap<string, string>,
): AssetPlacement[] => {
  const idObjectMap = new Map(objects.map((object) => [object.transformId, object]));
  const idWorldMatrixMap = new Map<string, Matrix4>();
  const getWorldMatrix = ({ parentId, position, rotation, scale, transformId }: SceneObject): Matrix4 => {
    const cached = idWorldMatrixMap.get(transformId);
    if (cached) return cached;
    const local = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    const parent = idObjectMap.get(parentId);
    const world = parent ? getWorldMatrix(parent).clone().multiply(local) : local;
    idWorldMatrixMap.set(transformId, world);
    return world;
  };
  // An object is placed where its chain of parents reaches a root; a chain that loops back on itself reaches none
  const checkIsPlaced = ({ parentId }: SceneObject, visitedIds: ReadonlySet<string> = new Set()): boolean => {
    if (parentId === ROOT_PARENT_ID) return true;
    const parent = idObjectMap.get(parentId);
    return parent && !visitedIds.has(parentId) ? checkIsPlaced(parent, new Set([...visitedIds, parentId])) : false;
  };
  return objects
    .filter((object) => checkIsPlaced(object))
    .map((object) => {
      const position = new Vector3();
      const rotation = new Quaternion();
      const scale = new Vector3();
      getWorldMatrix(object).decompose(position, rotation, scale);
      return {
        mesh: nameMeshMap.get(object.name) ?? "",
        name: object.name,
        position: position.toArray(),
        rotation: rotation.toArray(),
        scale: scale.toArray(),
      };
    });
};

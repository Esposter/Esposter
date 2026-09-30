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
  // The root an object's chain of parents reaches, where it is placed; a chain that loops back on itself reaches none
  const getRoot = (object: SceneObject, visitedIds: ReadonlySet<string> = new Set()): SceneObject | undefined => {
    if (object.parentId === ROOT_PARENT_ID) return object;
    const parent = idObjectMap.get(object.parentId);
    return parent && !visitedIds.has(object.parentId)
      ? getRoot(parent, new Set([...visitedIds, object.parentId]))
      : undefined;
  };
  return objects.flatMap((object) => {
    const root = getRoot(object);
    if (!root) return [];
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    getWorldMatrix(object).decompose(position, rotation, scale);
    return [
      {
        mesh: nameMeshMap.get(object.name) ?? "",
        name: object.name,
        position: position.toArray(),
        root: root.name,
        rotation: rotation.toArray(),
        scale: scale.toArray(),
      },
    ];
  });
};

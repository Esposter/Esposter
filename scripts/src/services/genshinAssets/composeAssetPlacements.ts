import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { SceneDrawing } from "#src/models/genshinAssets/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { composeWorldMatrices } from "#src/services/genshinAssets/composeWorldMatrices";
import { ROOT_PARENT_ID } from "#src/services/genshinAssets/constants";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { Quaternion, Vector3 } from "three";

// Every object's world placement, its local transform composed with each parent's up to its root. An object whose
// Parent is outside the dump (a prefab's part, placed by an instance in a block not read) has no place of its own to
// Compose, so it is left out rather than set down at the world's origin
export const composeAssetPlacements = (
  objects: readonly SceneObject[],
  gameObjectDrawingMap: ReadonlyMap<string, SceneDrawing>,
): AssetPlacement[] => {
  const idObjectMap = new Map(objects.map((object) => [object.transformId, object]));
  const idWorldMatrixMap = composeWorldMatrices(objects);
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
    const world = idWorldMatrixMap.get(object.transformId);
    if (!root || !world) return [];
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    world.decompose(position, rotation, scale);
    const drawing = gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId));
    return [
      {
        materials: drawing?.materials ?? [],
        mesh: drawing?.mesh ?? "",
        name: object.name,
        position: position.toArray(),
        root: root.name,
        rotation: rotation.toArray(),
        scale: scale.toArray(),
      },
    ];
  });
};

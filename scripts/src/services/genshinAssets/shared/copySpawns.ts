import type { AssetSpawn } from "#src/models/genshinAssets/shared/AssetSpawn";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { composeWorldMatrices } from "#src/services/genshinAssets/shared/composeWorldMatrices";
import { findRootObject } from "#src/services/genshinAssets/shared/findRootObject";
import { groupSceneChildren } from "#src/services/genshinAssets/shared/groupSceneChildren";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { Matrix3, Vector3 } from "three";

// A scene's objects with each spawned prefab that has copies laid out as its row: the prefab's whole subtree once a
// Copy, each copy's root moved along the world step by its place in the row, the row running ahead from the prefab's
// Own place, so the first copy keeps the prefab's own objects. A copy's objects are the prefab's under transform IDs of
// Their own, still drawing what the prefab's draw. The step is turned into the anchor's own space, so it holds whatever
// The anchor's turn and scale
export const copySpawns = (objects: readonly SceneObject[], spawns: readonly AssetSpawn[]): SceneObject[] => {
  const keyWorldMatrixMap = composeWorldMatrices(objects);
  const parentKeyChildrenMap = groupSceneChildren(objects);
  const collectSubtree = (object: SceneObject): SceneObject[] => [
    object,
    ...(parentKeyChildrenMap.get(toObjectKey(object.file, object.transformId)) ?? []).flatMap((child) =>
      collectSubtree(child),
    ),
  ];
  let copied = [...objects];
  for (const { copies, prefab } of spawns) {
    const root = copies && findRootObject(objects, prefab);
    if (!copies || !root) continue;
    const anchorWorld = keyWorldMatrixMap.get(toObjectKey(root.parentFile, root.parentId));
    if (!anchorWorld) continue;
    const localStep = new Vector3(...copies.step).applyMatrix3(
      new Matrix3().setFromMatrix4(anchorWorld.clone().invert()),
    );
    const subtree = collectSubtree(root);
    const subtreeSet = new Set(subtree);
    const rows = Array.from({ length: copies.count }, (_, index) => {
      if (index === 0) return subtree;
      const toCopyId = (transformId: string): string => `${transformId}~${index}`;
      return subtree.map((object) =>
        Object.assign(structuredClone(object), {
          childIds: object.childIds.map(toCopyId),
          parentId: object === root ? object.parentId : toCopyId(object.parentId),
          position:
            object === root
              ? new Vector3(...object.position).addScaledVector(localStep, index).toArray()
              : object.position,
          transformId: toCopyId(object.transformId),
        }),
      );
    });
    copied = [...copied.filter((object) => !subtreeSet.has(object)), ...rows.flat()];
  }
  return copied;
};

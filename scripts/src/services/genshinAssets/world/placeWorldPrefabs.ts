import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { WorldPrefabPlacements } from "#src/models/genshinAssets/world/WorldPrefabPlacements";

import { ROOT_PARENT_ID } from "#src/services/genshinAssets/shared/constants";
import { findRootObject } from "#src/services/genshinAssets/shared/findRootObject";
import { groupSceneChildren } from "#src/services/genshinAssets/shared/groupSceneChildren";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// The file every world anchor is held in, which no dump names
const WORLD_FILE = "world";
// A scene's objects with each prefab the world places hung from an anchor at each of its places, as the world's
// Streaming parents it: the anchor a root of its own named as the prefab's root, so every placement under it composes
// Through the world's transform and is kept as the prefab's arrangement. A prefab placed more than once is its whole
// Subtree again an anchor, under transform IDs of its own; a prefab no dump holds, or placed nowhere, is left as it is
export const placeWorldPrefabs = (
  objects: readonly SceneObject[],
  worldPrefabs: readonly WorldPrefabPlacements[],
): SceneObject[] => {
  const parentKeyChildrenMap = groupSceneChildren(objects);
  const collectSubtree = (object: SceneObject): SceneObject[] => [
    object,
    ...(parentKeyChildrenMap.get(toObjectKey(object.file, object.transformId)) ?? []).flatMap((child) =>
      collectSubtree(child),
    ),
  ];
  let placed = [...objects];
  for (const { places, prefab } of worldPrefabs) {
    const root = findRootObject(objects, prefab);
    if (!root || places.length === 0) continue;
    const subtree = collectSubtree(root);
    const subtreeSet = new Set(subtree);
    const copies: SceneObject[] = [];
    for (const [index, { position, rotation, scale }] of places.entries()) {
      const toCopyId = (transformId: string): string => `${transformId}~${index}`;
      const anchorId = `${prefab.pathId}~${index}`;
      copies.push({
        block: WORLD_FILE,
        childIds: [toCopyId(root.transformId)],
        components: [],
        file: WORLD_FILE,
        gameObjectId: anchorId,
        name: root.name,
        parentFile: WORLD_FILE,
        parentId: ROOT_PARENT_ID,
        position,
        rotation,
        scale,
        transformId: anchorId,
      });
      for (const object of subtree)
        copies.push(
          Object.assign(structuredClone(object), {
            childIds: object.childIds.map(toCopyId),
            parentFile: object === root ? WORLD_FILE : object.parentFile,
            parentId: object === root ? anchorId : toCopyId(object.parentId),
            transformId: toCopyId(object.transformId),
          }),
        );
    }
    placed = [...placed.filter((object) => !subtreeSet.has(object)), ...copies];
  }
  return placed;
};

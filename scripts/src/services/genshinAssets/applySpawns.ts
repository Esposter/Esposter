import type { AssetSpawn } from "#src/models/genshinAssets/AssetSpawn";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { findRootObject } from "#src/services/genshinAssets/findRootObject";

// A scene's objects with each spawned prefab's root hung from its anchor, as the script that spawns it parents it, so
// Every placement read composes through the anchor. A spawn whose anchor or prefab no dump holds leaves the objects
// As they are
export const applySpawns = (objects: readonly SceneObject[], spawns: readonly AssetSpawn[]): SceneObject[] => {
  const prefabParentMap = new Map(
    spawns.flatMap(({ anchor, prefab }) => {
      const anchorObject = findRootObject(objects, anchor);
      const prefabObject = findRootObject(objects, prefab);
      return anchorObject && prefabObject ? [[prefabObject, anchorObject] as const] : [];
    }),
  );
  return objects.map((object) => {
    const anchor = prefabParentMap.get(object);
    return anchor ? { ...object, parentFile: anchor.file, parentId: anchor.transformId } : object;
  });
};

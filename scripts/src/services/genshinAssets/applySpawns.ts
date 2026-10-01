import type { AssetSpawn } from "#src/models/genshinAssets/AssetSpawn";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { findRootObject } from "#src/services/genshinAssets/findRootObject";

// A scene's objects with each spawned prefab's root hung from its anchor, as the script that spawns it parents it, so
// Every placement read composes through the anchor, and at the position the spawn measures where it gives one. A spawn
// Whose anchor or prefab no dump holds leaves the objects as they are
export const applySpawns = (objects: readonly SceneObject[], spawns: readonly AssetSpawn[]): SceneObject[] => {
  const prefabSpawnMap = new Map(
    spawns.flatMap(({ anchor, position, prefab }) => {
      const anchorObject = findRootObject(objects, anchor);
      const prefabObject = findRootObject(objects, prefab);
      return anchorObject && prefabObject ? [[prefabObject, { anchorObject, position }] as const] : [];
    }),
  );
  return objects.map((object) => {
    const spawn = prefabSpawnMap.get(object);
    if (!spawn) return object;
    const { anchorObject, position = object.position } = spawn;
    return { ...object, parentFile: anchorObject.file, parentId: anchorObject.transformId, position };
  });
};

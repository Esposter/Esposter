import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";

// The name of each prefab a set of placements draws, by its world id: the last segment of the path the first of its
// Placements whose 64-bit path hash the community index names gives. A prefab no placement names is left out, since
// Its id alone says nothing of what it is
export const getPrefabNames = (
  placements: readonly WorldPlacement[],
  pathNames: ReadonlyMap<string, string>,
): Map<number, string> => {
  const prefabNames = new Map<number, string>();
  for (const { pathHash, prefabId } of placements) {
    const path = pathHash ? pathNames.get(getPathHashKey(pathHash)) : undefined;
    if (path && !prefabNames.has(prefabId)) prefabNames.set(prefabId, path.slice(path.lastIndexOf("/") + 1));
  }
  return prefabNames;
};

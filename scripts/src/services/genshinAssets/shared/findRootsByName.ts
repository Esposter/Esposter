import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { SceneLayout } from "#src/models/genshinAssets/shared/SceneLayout";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { findHierarchyRoot } from "#src/services/genshinAssets/shared/findHierarchyRoot";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The root of each prefab holding a GameObject of the name, named by its block as a component's roots are. A GameObject
// Of the name may sit at any depth of its prefab's hierarchy, so the root is found from it upward. A root whose file
// The CAB map does not know has no block to be named by, and is skipped; a name no root is found under is refused
export const findRootsByName = (
  { objects }: Pick<SceneLayout, "objects">,
  cabMap: ReadonlyMap<string, CabEntry>,
  name: string,
): AssetRoot[] => {
  const objectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const rootMap = new Map<string, AssetRoot>();
  for (const object of objects) {
    if (object.name !== name) continue;
    const root = findHierarchyRoot(objectMap, object);
    const block = cabMap.get(root.file)?.block;
    if (block) rootMap.set(`${block}\0${root.gameObjectId}`, { block, name: root.name, pathId: root.gameObjectId });
  }
  if (rootMap.size === 0)
    throw new InvalidOperationError(Operation.Read, name, "names no prefab root in the dumped layouts");
  return [...rootMap.values()];
};

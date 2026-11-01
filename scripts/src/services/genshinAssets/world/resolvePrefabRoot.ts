import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { ROOT_PARENT_ID } from "#src/services/genshinAssets/shared/constants";
import { basename } from "node:path";

// The root a prefab of the given name is exported from, where one of the candidate blocks dumps a game object of that
// Name: the only one of that name, or else the only one standing at the top of its block's hierarchy. A name that
// Several roots share, or that no candidate dumps, has no root, so it is reported rather than exported from a guess
export const resolvePrefabRoot = (
  name: string,
  candidateBlocks: readonly string[],
  objects: readonly SceneObject[],
): AssetRoot | undefined => {
  const named = candidateBlocks.flatMap((block) =>
    objects
      .filter((object) => object.block === basename(block, ".blk") && object.name === name)
      .map((object) => ({ block, object })),
  );
  const roots = named.length === 1 ? named : named.filter(({ object }) => object.parentId === ROOT_PARENT_ID);
  const [only] = roots;
  if (roots.length !== 1 || !only) return undefined;
  return { block: only.block, name, pathId: only.object.gameObjectId };
};

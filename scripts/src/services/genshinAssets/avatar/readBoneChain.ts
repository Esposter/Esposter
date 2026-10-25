import type { RendererBone } from "#src/models/genshinAssets/avatar/RendererBone";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { RIG_ROOT_BONE_NAME } from "#src/services/genshinAssets/avatar/constants";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// A transform's bone as the layout names it: its path from the rig's root down, and its scene object. A transform whose
// Chain the dumps lose, or that does not reach the rig's root, has no path and is undefined
export const readBoneChain = (
  file: string,
  transformId: string,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone | undefined => {
  const chain: SceneObject[] = [];
  let object = objectMap.get(toObjectKey(file, transformId));
  while (object) {
    chain.unshift(object);
    if (object.name === RIG_ROOT_BONE_NAME) break;
    object = objectMap.get(toObjectKey(object.parentFile || object.file, object.parentId));
  }
  const leaf = chain.at(-1);
  if (chain[0]?.name !== RIG_ROOT_BONE_NAME || !leaf) return undefined;
  return { object: leaf, path: chain.map(({ name }) => name).join("/") };
};

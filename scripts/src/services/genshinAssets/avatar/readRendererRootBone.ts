import type { RendererBone } from "#src/models/genshinAssets/avatar/RendererBone";
import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { readBoneChain } from "#src/services/genshinAssets/avatar/readBoneChain";

// The renderer's root bone, the transform its pose is taken relative to, which the face's light is read against
export const readRendererRootBone = (
  { rootBone }: SkinnedRenderer,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone | undefined => (rootBone ? readBoneChain(rootBone.file, rootBone.pathId, objectMap) : undefined);

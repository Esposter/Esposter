import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { RendererBone } from "#src/models/genshinAssets/avatar/RendererBone";
import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { readBoneChain } from "#src/services/genshinAssets/avatar/readBoneChain";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bones of a renderer in the order of its skin's joint indices, which is the order of its mesh's bind poses: joint i
// Is m_Bones[i]. A mesh whose bind poses do not match its renderer's bones is not the mesh the renderer draws, and a bone
// The layout cannot place has no rest, so both throw
export const readRendererBones = (
  skinned: SkinnedRenderer,
  name: string,
  mesh: DumpedMesh,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone[] => {
  if (mesh.m_BindPose.length !== skinned.renderer.m_Bones.length)
    throw new InvalidOperationError(
      Operation.Read,
      name,
      `has ${mesh.m_BindPose.length} bind poses for a renderer of ${skinned.renderer.m_Bones.length} bones`,
    );
  return skinned.bones.map((bone) => {
    const resolved = bone && readBoneChain(bone.file, bone.pathId, objectMap);
    if (!resolved)
      throw new InvalidOperationError(Operation.Read, name, "has a bone the layout does not place in the rig");
    return resolved;
  });
};

import type { PmxBone } from "#src/models/character/PmxBone";

import { Bone, Skeleton } from "three";

// A PMX model's bones as three's skeleton. The file places every bone in the model's space and three each from its
// Parent, so a bone stands where it does less where its parent does. Its inverse is taken by the mesh that binds it,
// Where the mesh stands once scaled, so the rest pose skins every vertex where the file has it
export const createPmxSkeleton = (pmxBones: readonly PmxBone[]): Skeleton => {
  const bones = pmxBones.map(({ name, parentIndex, position: [x, y, z] }) => {
    const bone = new Bone();
    bone.name = name;
    const [parentX, parentY, parentZ] = pmxBones[parentIndex]?.position ?? [0, 0, 0];
    bone.position.set(x - parentX, y - parentY, z - parentZ);
    return bone;
  });
  for (const [index, { parentIndex }] of pmxBones.entries()) {
    const bone = bones[index];
    const parent = bones[parentIndex];
    if (bone && parent) parent.add(bone);
  }

  return new Skeleton(bones);
};

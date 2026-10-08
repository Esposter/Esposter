import type { PmxBone } from "#src/models/character/PmxBone";

import { Bone, Matrix4, Skeleton } from "three";

// A PMX model's bones as three's skeleton. The file places every bone in the model's space and three each from its
// Parent, so a bone stands where it does less where its parent does; the model's rest pose turns no bone, so each is
// Bound by the step back from where it stands. A bone with no parent is a root, left for the mesh to hold
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

  const boneInverses = pmxBones.map(({ position: [x, y, z] }) => new Matrix4().makeTranslation(-x, -y, -z));
  return new Skeleton(bones, boneInverses);
};

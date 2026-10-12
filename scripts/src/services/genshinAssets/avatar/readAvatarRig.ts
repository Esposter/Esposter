import type { AvatarRigNode } from "#src/models/genshinAssets/avatar/AvatarRigNode";

import { HUMANOID_BONE_NAMES } from "#src/services/genshinAssets/avatar/constants";
import { resolveRigPaths } from "#src/services/genshinAssets/avatar/resolveRigPaths";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

export interface AvatarRig {
  humanoid: Record<string, number>;
  nodes: AvatarRigNode[];
}
interface DumpedAvatar {
  m_Avatar: {
    m_AvatarSkeleton: { m_Node: { m_ParentId: number }[] };
    m_DefaultPose: { m_X: { q: DumpedVector & { W: number }; s: DumpedVector; t: DumpedVector }[] };
    m_Human: { m_HumanBoneIndex: number[] };
    m_HumanSkeletonIndexArray: number[];
    m_SkeletonNameIDArray: number[];
  };
  m_TOS: Record<string, string>;
}

interface DumpedVector {
  X: number;
  Y: number;
  Z: number;
}

// The rig of an Avatar asset's JSON dump: every skeleton node with its path, parent and default pose in the game's own
// Axes, and the humanoid map naming each Unity humanoid bone by the node it is. The nodes keep the Avatar's own order
export const readAvatarRig = (json: string): AvatarRig => {
  const dump = parseMachineJson<DumpedAvatar>(json);
  const { m_Avatar, m_TOS } = dump;
  const { m_Node } = m_Avatar.m_AvatarSkeleton;
  const paths = resolveRigPaths(
    m_Node.map(({ m_ParentId }) => m_ParentId),
    m_Avatar.m_SkeletonNameIDArray,
    Object.values(m_TOS),
  );
  const nodes = m_Node.map(({ m_ParentId }, index): AvatarRigNode => {
    const pose = m_Avatar.m_DefaultPose.m_X[index];
    if (!pose) throw new InvalidOperationError(Operation.Read, "the avatar's default pose", `holds no node ${index}`);
    const { q, s, t } = pose;
    return {
      parent: m_ParentId,
      path: paths[index] ?? "",
      position: [t.X, t.Y, t.Z],
      rotation: [q.X, q.Y, q.Z, q.W],
      scale: [s.X, s.Y, s.Z],
    };
  });
  const humanoid = Object.fromEntries(
    m_Avatar.m_Human.m_HumanBoneIndex.flatMap((humanIndex, boneIndex): [string, number][] => {
      const node = humanIndex < 0 ? undefined : m_Avatar.m_HumanSkeletonIndexArray[humanIndex];
      const name = HUMANOID_BONE_NAMES[boneIndex];
      return node === undefined || name === undefined ? [] : [[name, node]];
    }),
  );
  return { humanoid, nodes };
};

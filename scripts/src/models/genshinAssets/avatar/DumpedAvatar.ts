import type { DumpedVector } from "#src/models/genshinAssets/avatar/DumpedVector";

export interface DumpedAvatar {
  m_Avatar: {
    m_AvatarSkeleton: { m_Node: { m_ParentId: number }[] };
    m_DefaultPose: { m_X: { q: DumpedVector & { W: number }; s: DumpedVector; t: DumpedVector }[] };
    m_Human: { m_HumanBoneIndex: number[] };
    m_HumanSkeletonIndexArray: number[];
    m_SkeletonNameIDArray: number[];
  };
  m_TOS: Record<string, string>;
}

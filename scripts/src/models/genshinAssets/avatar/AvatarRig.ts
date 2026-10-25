import type { AvatarRigNode } from "#src/models/genshinAssets/avatar/AvatarRigNode";

export interface AvatarRig {
  humanoid: Record<string, number>;
  nodes: AvatarRigNode[];
}

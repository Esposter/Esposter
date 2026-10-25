import type { SceneGroupMember, SceneNpcBorn } from "genshin-world";

import { SceneGroupMemberKind, SceneGroupSource } from "genshin-world";

// One NPC birth as a member of its group: the NPC it places, its place and turn, and the suites it is born in
export const toNpcMember = ({ configId, position, rotationY, suiteIds }: SceneNpcBorn): SceneGroupMember => ({
  kind: SceneGroupMemberKind.Npc,
  objectId: configId,
  place: {
    height: position.y,
    position: { x: position.x, z: position.z },
    ...(rotationY === undefined ? {} : { rotationY }),
    source: SceneGroupSource.NpcBirths,
  },
  source: SceneGroupSource.NpcBirths,
  suiteIds,
});

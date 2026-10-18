import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupMemberKind } from "#src/models/sceneGroup/SceneGroupMemberKind";
import { MONDSTADT_CRAFTING_BENCH_GROUP_ID, MONDSTADT_CRAFTING_BENCH_NPC_ID } from "#src/services/crafting/constants";

// Where Mondstadt's crafting bench stands: the place its scene group record gives its NPC member, or undefined where the
// Record holds no such member with a place
export const getCraftingBenchPlace = (sceneGroups: SceneGroups): SceneGroupPlace | undefined =>
  sceneGroups.groups[MONDSTADT_CRAFTING_BENCH_GROUP_ID]?.find(
    ({ kind, objectId }) => kind === SceneGroupMemberKind.Npc && objectId === MONDSTADT_CRAFTING_BENCH_NPC_ID,
  )?.place;

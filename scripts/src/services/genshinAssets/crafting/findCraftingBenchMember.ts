import type { SceneGroupMember, SceneGroups } from "genshin-world";

import {
  MONDSTADT_CRAFTING_BENCH_GROUP_ID,
  MONDSTADT_CRAFTING_BENCH_NPC_ID,
} from "#src/services/genshinAssets/crafting/constants";
import { SceneGroupMemberKind } from "genshin-world";

// The NPC member of the bench's scene group that the bench's place is built from. The bench place and the residents'
// Exclusion both read it from the scene group record here, so the NPC a bench stands for cannot differ between them
export const findCraftingBenchMember = (sceneGroups: SceneGroups): SceneGroupMember | undefined =>
  sceneGroups.groups[MONDSTADT_CRAFTING_BENCH_GROUP_ID]?.find(
    ({ kind, objectId }) => kind === SceneGroupMemberKind.Npc && objectId === MONDSTADT_CRAFTING_BENCH_NPC_ID,
  );

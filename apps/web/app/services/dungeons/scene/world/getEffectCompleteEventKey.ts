import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";

import { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// The name an NPC's effects-complete event is emitted and listened under: the NPC it belongs to, so each NPC's
// Event key is its own
export const getEffectCompleteEventKey = (npcName: NpcId) =>
  `${npcName}${ID_SEPARATOR}${EFFECT_COMPLETE_EVENT_KEY_SUFFIX}` as const;

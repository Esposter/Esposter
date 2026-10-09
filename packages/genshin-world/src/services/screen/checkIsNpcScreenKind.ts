import type { NpcScreenKind } from "#src/models/screen/NpcScreenKind";
import type { ScreenKind } from "#src/models/screen/ScreenKind";

import { NPC_SCREEN_KINDS } from "#src/services/screen/constants";

export const checkIsNpcScreenKind = (screenKind: ScreenKind): screenKind is NpcScreenKind =>
  NPC_SCREEN_KINDS.some((npcScreenKind) => npcScreenKind === screenKind);

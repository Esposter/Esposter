import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { UNTITLED_SCREEN_KINDS } from "#src/services/screen/constants";

// Whether a screen is one the host draws or the placeholder stands in for, rather than an untitled kind: the world, the
// Paimon menu, a talk, the game over or an NPC's own screen
export const checkIsTitledScreenKind = (screenKind: ScreenKind): screenKind is TitledScreenKind =>
  !UNTITLED_SCREEN_KINDS.some((untitledScreenKind) => untitledScreenKind === screenKind);

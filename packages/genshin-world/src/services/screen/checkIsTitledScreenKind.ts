import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind as Kind } from "#src/models/screen/ScreenKind";
import { checkIsNpcScreenKind } from "#src/services/screen/checkIsNpcScreenKind";

// Whether a screen is one the host draws or the placeholder stands in for, rather than the world, a talk, the game over or an
// NPC's own screen
export const checkIsTitledScreenKind = (screenKind: ScreenKind): screenKind is TitledScreenKind =>
  screenKind !== Kind.World &&
  screenKind !== Kind.Dialogue &&
  screenKind !== Kind.GameOver &&
  !checkIsNpcScreenKind(screenKind);

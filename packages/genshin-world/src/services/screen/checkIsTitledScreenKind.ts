import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { checkIsNpcScreenKind } from "#src/services/screen/checkIsNpcScreenKind";

// Whether a screen is one the host draws or the placeholder stands in for, rather than the world, the Paimon menu, a talk,
// The game over or an NPC's own screen
export const checkIsTitledScreenKind = (screenKind: ScreenKind): screenKind is TitledScreenKind =>
  screenKind !== ScreenKind.World &&
  screenKind !== ScreenKind.PaimonMenu &&
  screenKind !== ScreenKind.Dialogue &&
  screenKind !== ScreenKind.GameOver &&
  !checkIsNpcScreenKind(screenKind);

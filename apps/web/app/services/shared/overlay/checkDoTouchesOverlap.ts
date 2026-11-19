import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

import { checkIsSameTouch } from "#src/services/shared/overlay/checkIsSameTouch";

// Two writes overlap when they touch one row in common, whether either reads it or writes it
export const checkDoTouchesOverlap = (touches: TouchedKey[], others: TouchedKey[]): boolean =>
  touches.some((touch) => others.some((other) => checkIsSameTouch(touch, other)));

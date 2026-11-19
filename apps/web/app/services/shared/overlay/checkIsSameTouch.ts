import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";

import { checkIsSameKey } from "#src/services/shared/overlay/checkIsSameKey";

export const checkIsSameTouch = (touch: TouchedKey, other: TouchedKey): boolean =>
  touch.table === other.table && checkIsSameKey(touch.key, other.key);

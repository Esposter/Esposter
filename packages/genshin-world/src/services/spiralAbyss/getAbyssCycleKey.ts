import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { ABYSS_CORRIDOR_CYCLE_KEY, ABYSS_CORRIDOR_LAST_FLOOR_INDEX } from "#src/services/spiralAbyss/constants";

// The cycle a chamber's progress is saved under: the Corridor's one cycle, or the Moon Spire period the chamber is fought in.
// A Moon Spire chamber with no period has no cycle, so it has no key
export const getAbyssCycleKey = (floor: AbyssFloor, period: AbyssPeriod | undefined): string | undefined => {
  if (floor.index <= ABYSS_CORRIDOR_LAST_FLOOR_INDEX) return ABYSS_CORRIDOR_CYCLE_KEY;
  return period === undefined ? undefined : String(period.id);
};

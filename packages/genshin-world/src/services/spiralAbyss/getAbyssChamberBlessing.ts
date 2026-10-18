import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { AbyssChamberBlessing } from "#src/models/spiralAbyss/AbyssChamberBlessing";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { ABYSS_CORRIDOR_LAST_FLOOR_INDEX } from "#src/services/spiralAbyss/constants";
import { findAbyssPeriodAt } from "#src/services/spiralAbyss/findAbyssPeriodAt";
import { pickAbyssBenedictionList } from "#src/services/spiralAbyss/pickAbyssBenedictionList";

// What a chamber offers when entered at an instant: a Moon Spire chamber shows the blessing of the period covering the instant,
// And a Corridor chamber offers the Benedictions its game day's list holds. Undefined for a Moon Spire floor no period covers
export const getAbyssChamberBlessing = (
  floor: AbyssFloor,
  periods: readonly AbyssPeriod[],
  benedictionLists: readonly (readonly AbyssBenedictionChoice[])[],
  now: Temporal.Instant,
): AbyssChamberBlessing | undefined => {
  if (floor.index <= ABYSS_CORRIDOR_LAST_FLOOR_INDEX) {
    const choices = pickAbyssBenedictionList(benedictionLists, now);
    return choices && { choices: [...choices], kind: "choices" };
  }
  const period = findAbyssPeriodAt(periods, now);
  return period?.floorIds.includes(floor.id) ? { blessing: period.blessing, kind: "period" } : undefined;
};

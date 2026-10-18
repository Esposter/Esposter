import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { ABYSS_CORRIDOR_LAST_FLOOR_INDEX } from "#src/services/spiralAbyss/constants";

// The floors the entry offers: the current period's floors in the Moon Spire, and the Corridor's eight when no period is open
export const getAbyssFloorsOffered = (floors: readonly AbyssFloor[], period: AbyssPeriod | undefined): AbyssFloor[] =>
  period === undefined
    ? floors.filter(({ index }) => index <= ABYSS_CORRIDOR_LAST_FLOOR_INDEX)
    : floors.filter(({ id }) => period.floorIds.includes(id));

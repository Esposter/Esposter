import type { StatueRegion } from "#src/models/statue/StatueRegion";

import { MAXIMUM_STAMINA_CAP } from "#src/services/statue/constants";
import { STAMINA_MAX } from "genshin-engine";

// The party's maximum stamina: the controller's start, raised by the stamina each reached level of every region adds,
// And never past the cap. A level is reached when the region's level is at or past it
export const computeMaximumStamina = (regions: readonly StatueRegion[]): number => {
  const gainedStamina = regions.reduce(
    (total, { level, levels }) =>
      total +
      levels
        .filter((statueLevel) => statueLevel.level <= level)
        .reduce((regionTotal, { staminaShare }) => regionTotal + staminaShare, 0),
    0,
  );
  return Math.min(MAXIMUM_STAMINA_CAP, STAMINA_MAX + gainedStamina);
};

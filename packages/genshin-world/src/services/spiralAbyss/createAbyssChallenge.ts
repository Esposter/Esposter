import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { ABYSS_MONOLITH_FULL_PERCENT } from "#src/services/spiralAbyss/constants";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";

// A chamber about to be fought: none of its halves defeated, its clock at the full seconds of its floor, and its monolith at
// Full health when one of its conditions reads one. The clock is one for both halves, so the second half starts with what the first left
export const createAbyssChallenge = (floor: AbyssFloor, chamber: AbyssChamber): AbyssChallenge => {
  const hasMonolith = chamber.conditions.some(({ kind }) => kind === AbyssStarConditionKind.MonolithHealth);
  return {
    defeatedHalfCount: 0,
    halfCount: floor.teamCount,
    monolithPercent: hasMonolith ? ABYSS_MONOLITH_FULL_PERCENT : undefined,
    secondsLeft: getAbyssChamberSeconds(floor.index),
  };
};

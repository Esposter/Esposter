import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";

import { checkIsAbyssStarConditionMet } from "#src/services/spiralAbyss/checkIsAbyssStarConditionMet";

// The stars a clear of the chamber earns: one for each of its conditions that holds as the challenge clears
export const computeAbyssChamberStars = (chamber: AbyssChamber, challenge: AbyssChallenge): number =>
  chamber.conditions.filter((condition) => checkIsAbyssStarConditionMet(condition, challenge)).length;

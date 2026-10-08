import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssStarCondition } from "#src/models/spiralAbyss/AbyssStarCondition";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";

// Whether a star condition holds for a challenge as it stands, read at its clear: the clock left above the mark, or the
// Monolith's health above it. A chamber with no monolith meets no monolith condition
export const checkIsAbyssStarConditionMet = (condition: AbyssStarCondition, challenge: AbyssChallenge): boolean => {
  if (condition.kind === AbyssStarConditionKind.LeftTime) return challenge.secondsLeft > condition.threshold;
  return challenge.monolithPercent !== undefined && challenge.monolithPercent > condition.threshold;
};

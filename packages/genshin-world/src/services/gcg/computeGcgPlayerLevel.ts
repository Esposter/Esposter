import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

import { computeLevelReached } from "#src/services/shared/computeLevelReached";

// The card game's Player Level: none, as zero, until the tutorial quest is finished, then the level the EXP reaches over the
// Game's table, by the one rule the Friendship Level reads too
export const computeGcgPlayerLevel = (
  exp: number,
  playerLevels: readonly GcgPlayerLevel[],
  isTutorialQuestFinished: boolean,
): number => (isTutorialQuestFinished ? computeLevelReached(exp, playerLevels) : 0);

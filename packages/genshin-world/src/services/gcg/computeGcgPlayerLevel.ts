import type { GcgLevelLock } from "#src/models/gcg/GcgLevelLock";
import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

import { computeLevelReached } from "#src/services/shared/computeLevelReached";

// The card game's Player Level: none, as zero, until the tutorial quest is finished, then the level the EXP reaches over the
// Game's table, by the one rule the Friendship Level reads too. A lock holds it at the lock's level until the lock's main
// Quest is done, so the level is the lowest of the held levels the EXP reaches
export const computeGcgPlayerLevel = (
  exp: number,
  playerLevels: readonly GcgPlayerLevel[],
  isTutorialQuestFinished: boolean,
  locks: readonly GcgLevelLock[],
  completedMainQuestIds: ReadonlySet<string>,
): number => {
  if (!isTutorialQuestFinished) return 0;
  const heldLevel = locks.reduce(
    (level, { unlockLevel, unlockMainQuestId }) =>
      completedMainQuestIds.has(unlockMainQuestId) ? level : Math.min(level, unlockLevel),
    Infinity,
  );
  return Math.min(computeLevelReached(exp, playerLevels), heldLevel);
};

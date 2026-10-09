import type { ReputationLevel } from "#src/models/reputation/ReputationLevel";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";

// The Reputation a nation holds once `exp` more EXP is earned. The EXP carries up through each level's own requirement,
// And a nation's last level, which needs none, takes it no further, its EXP held at none
export const addReputationExp = (
  progress: ReputationProgress,
  exp: number,
  levels: readonly ReputationLevel[],
): ReputationProgress => {
  const computeProgress = (level: number, levelExp: number): ReputationProgress => {
    const nextLevelExp = levels.find((reputationLevel) => reputationLevel.level === level)?.nextLevelExp ?? 0;
    if (!nextLevelExp) return { exp: 0, level };
    if (levelExp < nextLevelExp) return { exp: levelExp, level };
    return computeProgress(level + 1, levelExp - nextLevelExp);
  };
  return computeProgress(progress.level, progress.exp + exp);
};

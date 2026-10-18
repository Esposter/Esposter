import { checkIsWeeklyBossQuickChallengeable } from "#src/services/bosses/checkIsWeeklyBossQuickChallengeable";

// The dungeon a weekly boss's quick challenge enters: its highest tier the Adventure Rank reaches, or its lowest when the
// Rank reaches none. A boss the rank cannot quick challenge enters none, and neither does one with no tiers
export const computeWeeklyBossQuickChallengeDungeonId = (
  levels: readonly { dungeonId: number; recommendedRank: number }[],
  adventureRank: number,
  isDomainLocked: boolean,
): number | undefined => {
  if (levels.length === 0 || !checkIsWeeklyBossQuickChallengeable(adventureRank, isDomainLocked)) return undefined;
  const reachedLevels = levels.filter(({ recommendedRank }) => recommendedRank <= adventureRank);
  const pickedLevel =
    reachedLevels.length > 0
      ? reachedLevels.reduce((highest, level) => (level.recommendedRank > highest.recommendedRank ? level : highest))
      : levels.reduce((lowest, level) => (level.recommendedRank < lowest.recommendedRank ? level : lowest));
  return pickedLevel.dungeonId;
};

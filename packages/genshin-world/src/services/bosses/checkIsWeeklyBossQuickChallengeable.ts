import { WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK } from "#src/services/bosses/constants";

// Whether a weekly boss's locked Trounce Domain can be quick challenged from the Adventurer Handbook: once the player has
// Reached the Adventure Rank that unlocks it, whatever quest would otherwise have opened it
export const checkIsWeeklyBossQuickChallengeable = (adventureRank: number, isDomainLocked: boolean): boolean =>
  isDomainLocked && adventureRank >= WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK;

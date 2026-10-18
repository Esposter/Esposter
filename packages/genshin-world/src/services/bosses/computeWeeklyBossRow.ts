import { WEEKLY_BOSS_MORA } from "#src/services/bosses/constants";

// The row of a World Level: World Level 0 and 1 read Domain Level I, and each World Level above reads the next row, up to VI.
// Provisional, the wiki's rows being by Domain Level
export const computeWeeklyBossRow = (worldLevel: number): number =>
  Math.min(Math.max(worldLevel, 1), WEEKLY_BOSS_MORA.length) - 1;

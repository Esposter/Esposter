import { clampTimeAdvance } from "#src/services/menu/clampTimeAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";

// The midnights the Time screen's confirm passes: the clock's minute moved on by the advance, clamped as the target's
// Minute is, and counted in whole days
export const getTimeSkippedDays = (clockMinutes: number, advanceMinutes: number): number =>
  Math.floor((clockMinutes + clampTimeAdvance(advanceMinutes)) / MINUTES_PER_DAY);

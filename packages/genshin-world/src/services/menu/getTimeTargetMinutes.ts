import { clampTimeAdvance } from "#src/services/menu/clampTimeAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";

// The minute of the day the Time screen confirms: the clock's minute moved on by the advance, clamped to thirty minutes
// Through two days, and wrapped past midnight as the clock itself wraps
export const getTimeTargetMinutes = (clockMinutes: number, advanceMinutes: number): number =>
  (clockMinutes + clampTimeAdvance(advanceMinutes)) % MINUTES_PER_DAY;

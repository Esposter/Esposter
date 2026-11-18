import { clampTimeAdvance } from "#src/services/menu/clampTimeAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";

// The days the target minute falls past the clock's own day, counted with the same clamped advance the target uses: 0
// For today, 1 for tomorrow and 2 for the day after
export const getTimeTargetDaysAhead = (clockMinutes: number, advanceMinutes: number): number =>
  Math.floor((clockMinutes + clampTimeAdvance(advanceMinutes)) / MINUTES_PER_DAY);

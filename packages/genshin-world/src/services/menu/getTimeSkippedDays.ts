import { TIME_MAXIMUM_ADVANCE_MINUTES, TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { MINUTES_PER_DAY } from "genshin-engine";
import { MathUtils } from "three";

// The midnights the Time screen's confirm passes: the clock's minute moved on by the advance, clamped as the target's
// Minute is, and counted in whole days
export const getTimeSkippedDays = (clockMinutes: number, advanceMinutes: number): number =>
  Math.floor(
    (clockMinutes + MathUtils.clamp(advanceMinutes, TIME_MINIMUM_ADVANCE_MINUTES, TIME_MAXIMUM_ADVANCE_MINUTES)) /
      MINUTES_PER_DAY,
  );

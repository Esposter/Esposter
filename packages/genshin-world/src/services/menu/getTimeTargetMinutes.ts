import { TIME_MAXIMUM_ADVANCE_MINUTES, TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { MINUTES_PER_DAY } from "genshin-engine";
import { MathUtils } from "three";

// The minute of the day the Time screen confirms: the clock's minute moved on by the advance, clamped to thirty minutes
// Through two days, and wrapped past midnight as the clock itself wraps
export const getTimeTargetMinutes = (clockMinutes: number, advanceMinutes: number): number => {
  const advance = MathUtils.clamp(advanceMinutes, TIME_MINIMUM_ADVANCE_MINUTES, TIME_MAXIMUM_ADVANCE_MINUTES);
  return (clockMinutes + advance) % MINUTES_PER_DAY;
};

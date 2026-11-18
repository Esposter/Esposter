import { TIME_MAXIMUM_ADVANCE_MINUTES, TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { MathUtils } from "three";

// The advance the Time screen counts on, kept at thirty minutes at least and two days at most, as the game's Time option
export const clampTimeAdvance = (advanceMinutes: number): number =>
  MathUtils.clamp(advanceMinutes, TIME_MINIMUM_ADVANCE_MINUTES, TIME_MAXIMUM_ADVANCE_MINUTES);

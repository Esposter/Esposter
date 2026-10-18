import { TIME_MAXIMUM_ADVANCE_MINUTES, TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { MathUtils } from "three";

// The advance the Time screen confirms, held between the least and the most the game lets the clock skip, which both the
// Hour the clock lands on and the midnights it passes are read from
export const clampTimeAdvance = (advanceMinutes: number): number =>
  MathUtils.clamp(advanceMinutes, TIME_MINIMUM_ADVANCE_MINUTES, TIME_MAXIMUM_ADVANCE_MINUTES);

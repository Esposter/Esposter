import type { SettingRange } from "#src/models/menu/SettingRange";

import { MathUtils } from "three";

// The value a slider lands on for a value at its track: rounded to the nearest of the range's steps and held inside its
// Limits, so a drag past either end stops at that end
export const snapToRange = (value: number, range: SettingRange): number =>
  MathUtils.clamp(range.min + Math.round((value - range.min) / range.step) * range.step, range.min, range.max);

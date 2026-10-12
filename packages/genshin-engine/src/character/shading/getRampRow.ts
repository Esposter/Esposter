import { COOL_RAMP_ROW_BASE, RAMP_ROW_BASE, RAMP_ROW_STEP } from "#src/character/shading/constants";

// The row of the packed shadow ramp a region shades on, the cool shadow's row taken with its own base
export const getRampRow = (region: number, isCoolShadow: boolean): number =>
  (isCoolShadow ? COOL_RAMP_ROW_BASE : RAMP_ROW_BASE) + RAMP_ROW_STEP * (region - 1);

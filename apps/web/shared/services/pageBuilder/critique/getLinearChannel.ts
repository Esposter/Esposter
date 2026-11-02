import {
  SRGB_GAMMA_EXPONENT,
  SRGB_GAMMA_OFFSET,
  SRGB_GAMMA_SCALE,
  SRGB_LINEAR_CUTOFF,
  SRGB_LINEAR_DIVISOR,
} from "#shared/services/pageBuilder/critique/constants";

// One sRGB channel, from 0 to 1, on the linear scale its luminance is weighted on
export const getLinearChannel = (channel: number): number =>
  channel <= SRGB_LINEAR_CUTOFF
    ? channel / SRGB_LINEAR_DIVISOR
    : ((channel + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE) ** SRGB_GAMMA_EXPONENT;

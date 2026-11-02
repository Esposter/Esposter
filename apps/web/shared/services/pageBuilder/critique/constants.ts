import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";

// The contrast a text must reach against its background, the WCAG normal-text threshold, held for every text in this version
export const MIN_TEXT_CONTRAST_RATIO = 4.5;
// The ratio is rounded to ten decimal places, so floating-point error cannot move an exact 4.5 under the threshold
export const CONTRAST_RATIO_SCALE = 1e10;
// WCAG relative luminance: the offset added to each side of the ratio, the weight of each channel, and the sRGB curve
export const CONTRAST_LUMINANCE_OFFSET = 0.05;
export const RED_LUMINANCE_WEIGHT = 0.2126;
export const GREEN_LUMINANCE_WEIGHT = 0.7152;
export const BLUE_LUMINANCE_WEIGHT = 0.0722;
export const SRGB_LINEAR_CUTOFF = 0.03928;
export const SRGB_LINEAR_DIVISOR = 12.92;
export const SRGB_GAMMA_OFFSET = 0.055;
export const SRGB_GAMMA_SCALE = 1.055;
export const SRGB_GAMMA_EXPONENT = 2.4;
// The colours of a page no style colours: the browser's white page and black text
export const PAGE_BACKGROUND_COLOR: SrgbColor = [1, 1, 1];
export const PAGE_TEXT_COLOR: SrgbColor = [0, 0, 0];
export const NARROWEST_DEVICE_WIDTH = Math.min(...Object.values(DEVICE_WIDTH_MAP));
// A rem is measured at the browser's default root size, and a vw at the narrowest device's width
const ROOT_FONT_SIZE_PIXELS = 16;
export const LENGTH_UNIT_PIXELS_MAP: Readonly<Record<string, number>> = Object.freeze({
  px: 1,
  rem: ROOT_FONT_SIZE_PIXELS,
  vw: NARROWEST_DEVICE_WIDTH / 100,
});
export const LENGTH_REGEX = new RegExp(`^(\\d+(?:\\.\\d+)?)(${Object.keys(LENGTH_UNIT_PIXELS_MAP).join("|")})$`, "u");

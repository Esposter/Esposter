import type { SrgbColor } from "#shared/models/pageBuilder/SrgbColor";

import { MAX_COLOR_CHANNEL } from "@/services/pageBuilder/constants";

// The comma form a browser computes an rgb colour in, its alpha present only where the colour is translucent
const RGB_COLOR_REGEX =
  /^rgba?\((?<red>\d+(?:\.\d+)?), (?<green>\d+(?:\.\d+)?), (?<blue>\d+(?:\.\d+)?)(?:, (?<alpha>\d+(?:\.\d+)?))?\)$/u;

// The sRGB channels of a colour the browser computes in rgb, each from 0 to 1. A translucent colour has no one colour to
// Read against a background, and a colour in another space is not in this form, so both read as nothing
export const parseRgbColor = (computedColor: string): SrgbColor | undefined => {
  const match = RGB_COLOR_REGEX.exec(computedColor);
  if (!match) return undefined;

  const [, red, green, blue, alpha] = match;
  if (alpha !== undefined && Number(alpha) < 1) return undefined;
  return [Number(red) / MAX_COLOR_CHANNEL, Number(green) / MAX_COLOR_CHANNEL, Number(blue) / MAX_COLOR_CHANNEL];
};

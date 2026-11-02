import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { MAX_COLOR_CHANNEL } from "@/services/shared/constants";

// The six-digit hex colour of sRGB channels, each from 0 to 1 and rounded to its 8-bit value: the form a colour
// Picker holds
export const getHexColor = (color: SrgbColor): string =>
  `#${Uint8Array.from(color, (channel) => Math.round(channel * MAX_COLOR_CHANNEL)).toHex()}`;

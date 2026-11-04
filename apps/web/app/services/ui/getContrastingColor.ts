import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { getContrastRatio } from "#shared/services/pageBuilder/critique/getContrastRatio";
import { MAX_COLOR_CHANNEL } from "@/services/shared/constants";
import { CONTRAST_BLACK, CONTRAST_WHITE } from "@/services/ui/constants";

// The sRGB channels of a six-digit hex colour, each from 0 to 1
const getSrgbColor = (hexColor: string): SrgbColor => [
  Number.parseInt(hexColor.slice(1, 3), 16) / MAX_COLOR_CHANNEL,
  Number.parseInt(hexColor.slice(3, 5), 16) / MAX_COLOR_CHANNEL,
  Number.parseInt(hexColor.slice(5, 7), 16) / MAX_COLOR_CHANNEL,
];

// The black or white hex colour that contrasts more with a six-digit hex fill, so a mark drawn over the fill reads on it
export const getContrastingColor = (fill: string): string => {
  const srgbFill = getSrgbColor(fill);
  const blackRatio = getContrastRatio(srgbFill, getSrgbColor(CONTRAST_BLACK));
  const whiteRatio = getContrastRatio(srgbFill, getSrgbColor(CONTRAST_WHITE));

  return blackRatio >= whiteRatio ? CONTRAST_BLACK : CONTRAST_WHITE;
};

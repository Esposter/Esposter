import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import { CONTRAST_LUMINANCE_OFFSET, CONTRAST_RATIO_SCALE } from "#shared/services/pageBuilder/critique/constants";
import { getRelativeLuminance } from "#shared/services/pageBuilder/critique/getRelativeLuminance";

// The WCAG contrast ratio of two colours, from 1 for identical colours to 21 for black on white, in either order
export const getContrastRatio = (first: SrgbColor, second: SrgbColor): number => {
  const firstLuminance = getRelativeLuminance(first);
  const secondLuminance = getRelativeLuminance(second);
  const lighterLuminance = Math.max(firstLuminance, secondLuminance);
  const darkerLuminance = Math.min(firstLuminance, secondLuminance);
  const ratio = (lighterLuminance + CONTRAST_LUMINANCE_OFFSET) / (darkerLuminance + CONTRAST_LUMINANCE_OFFSET);

  return Math.round(ratio * CONTRAST_RATIO_SCALE) / CONTRAST_RATIO_SCALE;
};

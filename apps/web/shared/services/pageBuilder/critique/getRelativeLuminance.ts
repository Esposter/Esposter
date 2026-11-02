import type { SrgbColor } from "#shared/models/shared/SrgbColor";

import {
  BLUE_LUMINANCE_WEIGHT,
  GREEN_LUMINANCE_WEIGHT,
  RED_LUMINANCE_WEIGHT,
} from "#shared/services/pageBuilder/critique/constants";
import { getLinearChannel } from "#shared/services/pageBuilder/critique/getLinearChannel";

// The WCAG relative luminance of a colour, from 0 for black to 1 for white
export const getRelativeLuminance = ([red, green, blue]: SrgbColor): number =>
  RED_LUMINANCE_WEIGHT * getLinearChannel(red) +
  GREEN_LUMINANCE_WEIGHT * getLinearChannel(green) +
  BLUE_LUMINANCE_WEIGHT * getLinearChannel(blue);

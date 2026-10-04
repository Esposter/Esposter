import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS, LUMINANCE } from "#src/services/genshinParity/shared/constants";

// A colour's luminance by the Rec. 709 weights
export const getLuminance = (color: Readonly<Vector>): number =>
  CHANNELS.reduce((sum: number, channel) => sum + LUMINANCE[channel] * color[channel], 0);

import type { LaggedAgreement } from "#src/models/genshinParity/music/LaggedAgreement";

import { readChromaAgreement } from "#src/services/genshinParity/music/readChromaAgreement";

// Two signals' pitch agreement over the frames given, as they stand and at the lag within `maxLag` frames either way
// That agrees best
export const readLaggedAgreement = (
  firstClasses: Float32Array,
  secondClasses: Float32Array,
  frames: number[],
  maxLag: number,
): LaggedAgreement => {
  let best = { lag: 0, lagAgreement: -Infinity };
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    const lagAgreement = readChromaAgreement(firstClasses, secondClasses, frames, lag);
    if (lagAgreement > best.lagAgreement) best = { lag, lagAgreement };
  }
  return { agreement: readChromaAgreement(firstClasses, secondClasses, frames, 0), ...best };
};

import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { GENSHIN_TONE_CONTRAST } from "genshin-engine";

// The refinement's first step from the shipped contrast, and its steps, which bring a contrast to a thousandth
const CONTRAST_STEP = 0.1;
const CONTRAST_ITERATION_COUNT = 40;
// The tone curve's contrast the samples' light lies flattest under (`computeLightPlaneResidual`), refined from the
// Shipped one, with the residual it leaves; the residual is smooth and has one minimum over any contrast a screen shows
export const solveToneContrast = async (
  samples: readonly DisplaySample[],
): Promise<{ contrast: number; residual: number }> => {
  const {
    cost,
    point: [contrast = GENSHIN_TONE_CONTRAST],
  } = await minimizeNelderMead(
    ([value = GENSHIN_TONE_CONTRAST]) => Promise.resolve(computeLightPlaneResidual(samples, value)),
    [GENSHIN_TONE_CONTRAST],
    [CONTRAST_STEP],
    CONTRAST_ITERATION_COUNT,
  );
  return { contrast, residual: cost };
};

import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { WhiteBalance } from "genshin-engine";

import { clampWhiteBalance } from "#src/services/genshinParity/display/clampWhiteBalance";
import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { computeWhiteBalance, GENSHIN_TONE_CONTRAST } from "genshin-engine";
import { Matrix3 } from "three";

// The refinement's first step from no balance, and its steps, which bring a temperature and a tint to a tenth
const BALANCE_STEP = 10;
const BALANCE_ITERATION_COUNT = 80;
// The white balance (`computeWhiteBalance`) the samples' light lies flattest under at the shipped contrast
// (`computeLightPlaneResidual`, each colour taken back through its inverse), refined from none, with the residual it
// Leaves; the matrix is set by a script from data no export holds, so the stone's shading is what measures it
export const solveWhiteBalance = async (
  samples: readonly DisplaySample[],
): Promise<{ residual: number; whiteBalance: WhiteBalance }> => {
  const whiteBalance = new Matrix3();
  const { cost, point } = await minimizeNelderMead(
    (candidate) =>
      Promise.resolve(
        computeLightPlaneResidual(
          samples,
          GENSHIN_TONE_CONTRAST,
          computeWhiteBalance(clampWhiteBalance(candidate), whiteBalance),
        ),
      ),
    [0, 0],
    [BALANCE_STEP, BALANCE_STEP],
    BALANCE_ITERATION_COUNT,
  );
  return { residual: cost, whiteBalance: clampWhiteBalance(point) };
};

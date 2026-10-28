import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";

import { accumulateNormalEquations } from "#src/services/genshinParity/shared/accumulateNormalEquations";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { RIDGE } from "#src/services/genshinParity/witness/constants";
import { groupStoneBins } from "#src/services/genshinParity/witness/groupStoneBins";
import { solveNonNegativeSystem } from "#src/services/recreation/solve/solveNonNegativeSystem";
import { toSrgb } from "#src/services/shared/toSrgb";
import { ID_SEPARATOR } from "@esposter/shared";
import { toneMapGenshin } from "genshin-engine";
import { Matrix3, Vector3 } from "three";

// What a haze leaves of the stone unexplained, the samples' opacities set under it: each part's light free in each bin
// Of its ramp coordinate and how far its face turns up, and the haze's colours away from the sun and toward it, solved
// Channel by channel by non-negative least squares over the bins (`groupStoneBins`), each bin's colour then drawn
// Through the white balance and the tone curve and read against the reference's as the display encodes them. The
// Light is left free so its own error cannot stand in for a haze: solved under the stone light's model, the haze took
// Whatever that light could not draw, and every hour's ran off its bracket. The residual is read as the display
// Encodes it, the space the frame's score reads, since in scene colour the curve's steep top stretches a near-white
// Bin many times over its neighbours'. Returns the root mean square over the bins, each weighed by its pixels
export const computeHazeResidual = (
  samples: readonly StoneLightSample[],
  whiteBalance: Matrix3 = new Matrix3(),
): number => {
  const bins = groupStoneBins(samples, whiteBalance);
  const lightBins = [...new Set(samples.map(({ lightBin, part }) => `${part}${ID_SEPARATOR}${lightBin}`))];
  const lightBinIndexMap = new Map(lightBins.map((lightBin, index) => [lightBin, index]));
  const hazeUnknown = lightBins.length;
  const unknownCount = hazeUnknown + 2;
  const total = bins.reduce((sum, { samples: binSamples }) => sum + binSamples.length, 0);
  const predictedColors = bins.map(() => [0, 0, 0]);
  for (const channel of CHANNELS) {
    const rows = bins.map(({ samples: binSamples, sceneColor }) => {
      const row = Array.from({ length: unknownCount }, () => 0);
      let glow = 0;
      for (const { albedo, emission, lightBin, occlusion, opacity, part, scatter } of binSamples) {
        const through = occlusion * (1 - opacity);
        const unknown = lightBinIndexMap.get(`${part}${ID_SEPARATOR}${lightBin}`) ?? 0;
        row[unknown] = (row[unknown] ?? 0) + albedo[channel] * through;
        row[hazeUnknown] = (row[hazeUnknown] ?? 0) + opacity * (1 - scatter);
        row[hazeUnknown + 1] = (row[hazeUnknown + 1] ?? 0) + opacity * scatter;
        glow += emission[channel] * through;
      }
      return {
        glow: glow / binSamples.length,
        row: row.map((value) => value / binSamples.length),
        target: sceneColor[channel],
        weight: binSamples.length,
      };
    });
    const { gram, right } = accumulateNormalEquations(
      rows.map(({ glow, row, target, weight }) => ({ row, target: target - glow, weight })),
      unknownCount,
    );
    for (const [unknown, gramRow] of gram.entries()) gramRow[unknown] = (gramRow[unknown] ?? 0) + RIDGE * total;
    const solution = solveNonNegativeSystem(gram, right);
    for (const [binIndex, { glow, row }] of rows.entries()) {
      const predictedColor = predictedColors[binIndex] ?? [];
      predictedColor[channel] = row.reduce((sum, value, unknown) => sum + value * (solution[unknown] ?? 0), glow);
    }
  }
  let squared = 0;
  for (const [binIndex, { displayColor, samples: binSamples }] of bins.entries()) {
    const { x, y, z } = new Vector3(...(predictedColors[binIndex] ?? [])).applyMatrix3(whiteBalance);
    const shownColor = toneMapGenshin([x, y, z]);
    for (const channel of CHANNELS)
      squared += binSamples.length * (toSrgb(shownColor[channel]) - toSrgb(displayColor[channel])) ** 2;
  }
  return Math.sqrt(squared / Math.max(total * CHANNELS.length, 1));
};

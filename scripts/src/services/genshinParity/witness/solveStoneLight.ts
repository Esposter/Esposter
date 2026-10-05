import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";
import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "genshin-engine";

// The least pixels a bin is read over, under which its mean is mostly one texel
const MIN_BIN_COUNT = 30;
// The ridge each unknown is held toward none by, as a share of the pixels, so a knot no bin reads stays at none rather
// Than taking whatever value a singular system lends it
const RIDGE = 1e-6;
// How strongly the ramp's bends are held toward a straight line, as a share of the pixels: a ramp is a smooth curve
// From the shade to the lit colour, and bins that read few knots would otherwise swing them apart
const RAMP_SMOOTHNESS = 0.05;
// How hard the ramp's dark end is held at none, as a share of the pixels. A ramp's knots share every coordinate out
// Whole, so a colour taken off every knot and put on the sky's constant term draws every pixel the same and no frame
// Tells the two apart: the dark end held at none makes the ramp the sun's own light and leaves the sky the rest
const RAMP_DARK_END_HOLD = 1000;
// A bend of three neighbouring knots, their second difference, by each knot's offset from the middle one
const BEND_STENCIL = [
  [-1, 1],
  [0, -2],
  [1, 1],
] as const;
// Each knot's weight at a ramp coordinate, the coordinate read between its two nearest knots as a texture's linear
// Filtering reads them
const writeRampWeights = (coordinate: number, weights: number[]): void => {
  const position = Math.min(Math.max(coordinate, 0), 1) * (STONE_RAMP_KNOT_COUNT - 1);
  const knot = Math.min(Math.floor(position), STONE_RAMP_KNOT_COUNT - 2);
  const share = position - knot;
  weights.fill(0);
  weights[knot] = 1 - share;
  weights[knot + 1] = share;
};
// The stone's light under the scene's own haze, solved channel by channel by least squares over the bins' means: each
// Pixel's scene colour is its albedo times the ramp at its coordinate plus the harmonics at its normal, with its glow,
// The part the haze lets through, plus the haze's own colour blended toward its sunward one by its scatter, by its
// Opacity, which is linear in the light. The haze's colours are the cloud sea's, measured where it shows them: solved
// Here, they would take up the light's own errors over the stone and carry them onto the sea. Bins average the pixels
// Whose texels do not line up with the reference's, so their shading is read rather than their texels. Returns the
// Light and the residual over the bins beside their spread about their mean, the share the light leaves unexplained
export const solveStoneLight = (
  samples: readonly StoneLightSample[],
  { color: hazeColor, scatterColor: hazeScatterColor }: { color: Vector; scatterColor: Vector },
): { deviation: number; light: StoneLight; residual: number } => {
  const sampleBinMap = Map.groupBy(samples, ({ bin }) => bin);
  const bins = [...sampleBinMap.values()].filter((binSamples) => binSamples.length >= MIN_BIN_COUNT);
  const total = bins.reduce((sum, binSamples) => sum + binSamples.length, 0);
  const unknownCount = STONE_RAMP_KNOT_COUNT + STONE_HARMONIC_COUNT;
  const weights = Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => 0);
  const ramp = Array.from({ length: STONE_RAMP_KNOT_COUNT }, (): number[] => [0, 0, 0]);
  const harmonics = Array.from({ length: STONE_HARMONIC_COUNT }, (): number[] => [0, 0, 0]);
  let squared = 0;
  let spread = 0;
  for (const channel of CHANNELS) {
    const rows = bins.map((binSamples) => {
      const row = Array.from({ length: unknownCount }, () => 0);
      let target = 0;
      for (const { albedo, color, emission, harmonics: terms, opacity, rampCoordinate, scatter } of binSamples) {
        const through = albedo[channel] * (1 - opacity);
        writeRampWeights(rampCoordinate, weights);
        for (const [knot, weight] of weights.entries()) row[knot] = (row[knot] ?? 0) + weight * through;
        for (const [term, value] of terms.entries())
          row[STONE_RAMP_KNOT_COUNT + term] = (row[STONE_RAMP_KNOT_COUNT + term] ?? 0) + value * through;
        // The glow and the rim the material adds after lighting are known, as is the haze the scene draws over it, so
        // Both leave the colour the light explains
        const haze = opacity * ((1 - scatter) * hazeColor[channel] + scatter * hazeScatterColor[channel]);
        target += color[channel] - emission[channel] * (1 - opacity) - haze;
      }
      return {
        row: row.map((value) => value / binSamples.length),
        target: target / binSamples.length,
        weight: binSamples.length,
      };
    });
    const gram = Array.from({ length: unknownCount }, () => Array.from({ length: unknownCount }, () => 0));
    const right = Array.from({ length: unknownCount }, () => 0);
    for (const { row, target, weight } of rows)
      for (const [first, firstValue] of row.entries()) {
        right[first] = (right[first] ?? 0) + weight * firstValue * target;
        const gramRow = gram[first] ?? [];
        for (const [second, secondValue] of row.entries())
          gramRow[second] = (gramRow[second] ?? 0) + weight * firstValue * secondValue;
      }
    for (const [unknown, gramRow] of gram.entries()) gramRow[unknown] = (gramRow[unknown] ?? 0) + RIDGE * total;
    const darkEndRow = gram[0] ?? [];
    darkEndRow[0] = (darkEndRow[0] ?? 0) + RAMP_DARK_END_HOLD * total;
    // Each bend of three neighbouring knots, their second difference, held toward none
    for (let knot = 1; knot < STONE_RAMP_KNOT_COUNT - 1; knot++)
      for (const [firstOffset, firstWeight] of BEND_STENCIL)
        for (const [secondOffset, secondWeight] of BEND_STENCIL) {
          const gramRow = gram[knot + firstOffset] ?? [];
          gramRow[knot + secondOffset] =
            (gramRow[knot + secondOffset] ?? 0) + RAMP_SMOOTHNESS * total * firstWeight * secondWeight;
        }
    const solution = solveLinearSystem(gram, right) ?? right.map(() => 0);
    for (const [knot, knotColor] of ramp.entries()) knotColor[channel] = solution[knot] ?? 0;
    for (const [term, termColor] of harmonics.entries())
      termColor[channel] = solution[STONE_RAMP_KNOT_COUNT + term] ?? 0;
    const mean = rows.reduce((sum, { target, weight }) => sum + target * weight, 0) / Math.max(total, 1);
    for (const { row, target, weight } of rows) {
      const predicted = row.reduce((sum, value, unknown) => sum + value * (solution[unknown] ?? 0), 0);
      squared += weight * (predicted - target) ** 2;
      spread += weight * (target - mean) ** 2;
    }
  }
  const count = Math.max(total * CHANNELS.length, 1);
  return { deviation: Math.sqrt(spread / count), light: { harmonics, ramp }, residual: Math.sqrt(squared / count) };
};

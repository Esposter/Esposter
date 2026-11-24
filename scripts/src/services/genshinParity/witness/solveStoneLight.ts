import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { StoneLight } from "genshin-engine";

import { accumulateNormalEquations } from "#src/services/genshinParity/shared/accumulateNormalEquations";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { computeSkyLobeHarmonics } from "#src/services/genshinParity/witness/computeSkyLobeHarmonics";
import { RIDGE, SKY_LOBE_DIRECTIONS } from "#src/services/genshinParity/witness/constants";
import { groupStoneBins } from "#src/services/genshinParity/witness/groupStoneBins";
import { writeStoneRampWeights } from "#src/services/genshinParity/witness/writeStoneRampWeights";
import { solveNonNegativeSystem } from "#src/services/recreation/solve/solveNonNegativeSystem";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  computeStoneDarkening,
  STONE_HARMONIC_COUNT,
  STONE_HEIGHT_FALLOFF,
  STONE_RAMP_KNOT_COUNT,
} from "genshin-engine";
import { Matrix3 } from "three";

// How strongly the ramp's bends are held toward a straight line, as a share of the pixels: a ramp is a smooth curve
// From the shade to the lit colour, and bins that read few knots would otherwise swing them apart
const RAMP_SMOOTHNESS = 0.05;
// The sky's lights, one from each of its directions
const SKY_LOBES = SKY_LOBE_DIRECTIONS.map((direction) => computeSkyLobeHarmonics(direction));
// A bend of the ramp, the change between two neighbouring steps, by each step's offset from the first
const BEND_STENCIL = [
  [0, -1],
  [1, 1],
] as const;
// The stone's light and the haze's colours over it, solved channel by channel by least squares over the bins' means,
// Over lights that can be: each pixel's scene colour is its albedo times the ramp at its coordinate, the harmonics at
// Its normal and the light fading with its height, all darkening with its height at the rate given
// (`computeStoneDarkening`), which the solve holds rather than solves, with its glow, darkened by its occlusion, the
// Part the haze lets through, plus the haze's colour blended toward its sunward one by its scatter, by its opacity,
// Which is linear in both. Every unknown is a light none of which is negative, solved by non-negative least squares
// (`solveNonNegativeSystem`): the ramp rises from none at its dark end by steps none of which falls, the sky is a sum
// Of lights from directions all round (`computeSkyLobeHarmonics`), the light fading with height adds, and the haze's
// Two colours are colours. Solved free, one light could cancel another, and a light could fall below none under a sky
// Redder than the frame, so none of them may be negative. Each part's pixels are binned apart from the others', each
// Bin weighed by its pixels, so one part filling the frame's foot cannot outweigh the far towers. The haze over the
// Stone is its own, drawn apart from the cloud sea's (`createHeightFogNode`'s stone mask), because a light that cannot
// Fall below none cannot darken a stone a shared haze holds too bright. Bins average the pixels whose texels do not
// Line up with the reference's, so their shading is read rather than their texels. A bin's colour is its pixels' mean
// As the screen shows them, taken back through the tone curve once (`groupStoneBins`) rather than pixel by pixel, since
// The brightest pixels would then set the mean, and not weighed by the curve's slope, which rises far more steeply at
// Black than in the middle. it is then taken back through the white balance the frame passes through before the curve,
// So the light solved is the one under it: a balance can take the stone's red under the curve's black, which no light
// That cannot fall below none reaches on its own. Returns the light, the pixels its bins kept, and the residual over
// The bins beside their spread about their mean, the share the light leaves unexplained
export const solveStoneLight = (
  samples: readonly StoneLightSample[],
  whiteBalance: Matrix3 = new Matrix3(),
  heightDarkening = 0,
): { count: number; deviation: number; light: StoneLight; residual: number } => {
  const stoneBins = groupStoneBins(samples, whiteBalance);
  // The ramp's steps up from its dark end, then the sky's lights, the light fading with height, and the haze's colour
  // Away from the sun and toward it
  const stepCount = STONE_RAMP_KNOT_COUNT - 1;
  const heightFadeUnknown = stepCount + SKY_LOBES.length;
  const hazeUnknown = heightFadeUnknown + 1;
  const unknownCount = hazeUnknown + 2;
  const weights = Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => 0);
  // The terms no channel scales, computed once per sample rather than once per channel: each step's lift (a step lifts
  // Every knot from its own up, so its weight is theirs together), each sky lobe's dot product, the height fall and the
  // Darkening with height
  const bins = stoneBins.map(({ samples: binSamples }) =>
    binSamples.map((sample) => {
      writeStoneRampWeights(sample.rampCoordinate, weights);
      const steps = Array.from({ length: stepCount }, () => 0);
      let above = 0;
      for (let step = stepCount - 1; step >= 0; step--) {
        above += weights[step + 1] ?? 0;
        steps[step] = above;
      }
      return {
        ...sample,
        darkening: computeStoneDarkening(sample.height, heightDarkening),
        fall: Math.exp(-sample.height * STONE_HEIGHT_FALLOFF),
        lobeDots: SKY_LOBES.map((lobeTerms) =>
          lobeTerms.reduce((sum, value, term) => sum + value * (sample.harmonics[term] ?? 0), 0),
        ),
        steps,
      };
    }),
  );
  const total = bins.reduce((sum, binSamples) => sum + binSamples.length, 0);
  let squared = 0;
  let spread = 0;
  const solutions = CHANNELS.map((channel) => {
    const rows = bins.map((binSamples, binIndex) => {
      const row = Array.from({ length: unknownCount }, () => 0);
      let target = 0;
      for (const { albedo, darkening, emission, fall, lobeDots, occlusion, opacity, scatter, steps } of binSamples) {
        const through = albedo[channel] * occlusion * (1 - opacity);
        // The light alone darkens with height, not the glow the material adds after it nor the haze over it
        const lit = through * darkening;
        for (const [step, above] of steps.entries()) row[step] = (row[step] ?? 0) + above * lit;
        for (const [lobe, dot] of lobeDots.entries()) row[stepCount + lobe] = (row[stepCount + lobe] ?? 0) + dot * lit;
        row[heightFadeUnknown] = (row[heightFadeUnknown] ?? 0) + fall * lit;
        row[hazeUnknown] = (row[hazeUnknown] ?? 0) + opacity * (1 - scatter);
        row[hazeUnknown + 1] = (row[hazeUnknown + 1] ?? 0) + opacity * scatter;
        // The glow and the rim the material adds after lighting are known, so they leave the colour the light explains
        target -= emission[channel] * occlusion * (1 - opacity);
      }
      return {
        row: row.map((value) => value / binSamples.length),
        target: (stoneBins[binIndex]?.sceneColor[channel] ?? 0) + target / binSamples.length,
        weight: binSamples.length,
      };
    });
    const { gram, right } = accumulateNormalEquations(rows, unknownCount);
    for (const [unknown, gramRow] of gram.entries()) gramRow[unknown] = (gramRow[unknown] ?? 0) + RIDGE * total;
    // Each bend of the ramp, the change between two neighbouring steps, held toward none
    for (let step = 0; step < stepCount - 1; step++)
      for (const [first, firstWeight] of BEND_STENCIL)
        for (const [second, secondWeight] of BEND_STENCIL) {
          const gramRow = gram[step + first];
          if (!gramRow)
            throw new InvalidOperationError(Operation.Read, "gram", `no row ${step + first} of ${unknownCount}`);
          gramRow[step + second] = (gramRow[step + second] ?? 0) + RAMP_SMOOTHNESS * total * firstWeight * secondWeight;
        }
    const solution = solveNonNegativeSystem(gram, right);
    const mean = rows.reduce((sum, { target, weight }) => sum + target * weight, 0) / Math.max(total, 1);
    for (const { row, target, weight } of rows) {
      const predicted = row.reduce((sum, value, unknown) => sum + value * (solution[unknown] ?? 0), 0);
      squared += weight * (predicted - target) ** 2;
      spread += weight * (target - mean) ** 2;
    }
    return solution;
  });
  const ramp = Array.from({ length: STONE_RAMP_KNOT_COUNT }, (_value, knot) =>
    solutions.map((solution) => solution.slice(0, knot).reduce((sum, value) => sum + value, 0)),
  );
  const harmonics = Array.from({ length: STONE_HARMONIC_COUNT }, (_value, term) =>
    solutions.map((solution) =>
      SKY_LOBES.reduce((sum, lobeTerms, lobe) => sum + (lobeTerms[term] ?? 0) * (solution[stepCount + lobe] ?? 0), 0),
    ),
  );
  const heightFade = solutions.map((solution) => solution[heightFadeUnknown] ?? 0);
  const hazeColor = solutions.map((solution) => solution[hazeUnknown] ?? 0);
  const hazeScatterColor = solutions.map((solution) => solution[hazeUnknown + 1] ?? 0);
  const count = Math.max(total * CHANNELS.length, 1);
  return {
    count: total,
    deviation: Math.sqrt(spread / count),
    light: { harmonics, hazeColor, hazeScatterColor, heightDarkening, heightFade, ramp },
    residual: Math.sqrt(squared / count),
  };
};

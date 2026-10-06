import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { StoneLight } from "genshin-engine";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { solveNonNegativeSystem } from "#src/services/genshinParity/shared/solveNonNegativeSystem";
import { computeSkyLobeHarmonics } from "#src/services/genshinParity/witness/computeSkyLobeHarmonics";
import { SKY_LOBE_DIRECTIONS } from "#src/services/genshinParity/witness/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { STONE_HARMONIC_COUNT, STONE_HEIGHT_FALLOFF, STONE_RAMP_KNOT_COUNT } from "genshin-engine";

// The least pixels a bin is read over, under which its mean is mostly one texel
const MIN_BIN_COUNT = 30;
// The ridge each unknown is held toward none by, as a share of the pixels, so a step or a light no bin reads stays at
// None rather than taking whatever value a singular system lends it
const RIDGE = 1e-6;
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
// The stone's light and the haze's colours over it, solved channel by channel by least squares over the bins' means,
// Over lights that can be: each pixel's scene colour is its albedo times the ramp at its coordinate, the harmonics at
// Its normal and the light fading with its height, with its glow, darkened by its occlusion, the part the haze lets
// Through, plus the haze's colour blended toward its sunward one by its scatter, by its opacity, which is linear in
// Both. Every unknown is a light none of which is negative, solved by non-negative least squares
// (`solveNonNegativeSystem`): the ramp rises from none at its dark end by steps none of which falls, the sky is a sum
// Of lights from directions all round (`computeSkyLobeHarmonics`), the light fading with height adds, and the haze's
// Two colours are colours. Solved free, one light cancelled another, the night's fading light red below none under a
// Sky redder than its frame, which turned every tower's colour as it rose. Each part's pixels are binned apart from the
// Others', each bin weighed by its pixels: weighing every part as much as the walkway filling the frame's foot lit the
// Far towers too bright, scoring the night six hundredths worse. The haze over the stone is its own, drawn apart from
// The cloud sea's (`createHeightFogNode`'s stone mask): held to the cloud sea's, the far stone stood too bright under
// It by day, and a light that cannot fall below none to darken it again left the error standing. Bins
// Average the pixels whose texels do not line up with the reference's, so their shading is read rather than their
// Texels. Returns the light, the pixels its bins kept, and the residual over the bins beside their spread about their
// Mean, the share the light leaves unexplained. Bins too sparse to read are dropped, and with none left there is no
// Light to solve
export const solveStoneLight = (
  samples: readonly StoneLightSample[],
): { count: number; deviation: number; light: StoneLight; residual: number } => {
  const sampleBinMap = Map.groupBy(samples, ({ bin, part }) => `${part}/${bin}`);
  const bins = [...sampleBinMap.values()].filter((binSamples) => binSamples.length >= MIN_BIN_COUNT);
  if (bins.length === 0)
    throw new InvalidOperationError(
      Operation.Read,
      "bins",
      `none of ${sampleBinMap.size} holds ${MIN_BIN_COUNT} pixels`,
    );
  const total = bins.reduce((sum, binSamples) => sum + binSamples.length, 0);
  // The ramp's steps up from its dark end, then the sky's lights, the light fading with height, and the haze's colour
  // Away from the sun and toward it
  const stepCount = STONE_RAMP_KNOT_COUNT - 1;
  const heightFadeUnknown = stepCount + SKY_LOBES.length;
  const hazeUnknown = heightFadeUnknown + 1;
  const unknownCount = hazeUnknown + 2;
  const weights = Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => 0);
  let squared = 0;
  let spread = 0;
  const solutions = CHANNELS.map((channel) => {
    const rows = bins.map((binSamples) => {
      const row = Array.from({ length: unknownCount }, () => 0);
      let target = 0;
      for (const {
        albedo,
        color,
        emission,
        harmonics: terms,
        height,
        occlusion,
        opacity,
        rampCoordinate,
        scatter,
      } of binSamples) {
        const through = albedo[channel] * occlusion * (1 - opacity);
        writeRampWeights(rampCoordinate, weights);
        // A step lifts every knot from its own up, so its weight is theirs together
        let above = 0;
        for (let step = stepCount - 1; step >= 0; step--) {
          above += weights[step + 1] ?? 0;
          row[step] = (row[step] ?? 0) + above * through;
        }
        for (const [lobe, lobeTerms] of SKY_LOBES.entries())
          row[stepCount + lobe] =
            (row[stepCount + lobe] ?? 0) +
            lobeTerms.reduce((sum, value, term) => sum + value * (terms[term] ?? 0), 0) * through;
        row[heightFadeUnknown] = (row[heightFadeUnknown] ?? 0) + Math.exp(-height * STONE_HEIGHT_FALLOFF) * through;
        row[hazeUnknown] = (row[hazeUnknown] ?? 0) + opacity * (1 - scatter);
        row[hazeUnknown + 1] = (row[hazeUnknown + 1] ?? 0) + opacity * scatter;
        // The glow and the rim the material adds after lighting are known, so they leave the colour the light explains
        target += color[channel] - emission[channel] * occlusion * (1 - opacity);
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
    // Each bend of the ramp, the change between two neighbouring steps, held toward none
    for (let step = 0; step < stepCount - 1; step++)
      for (const [first, firstWeight] of BEND_STENCIL)
        for (const [second, secondWeight] of BEND_STENCIL) {
          const gramRow = gram[step + first] ?? [];
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
    light: { harmonics, hazeColor, hazeScatterColor, heightFade, ramp },
    residual: Math.sqrt(squared / count),
  };
};

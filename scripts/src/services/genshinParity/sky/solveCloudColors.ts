import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";
import { getLuminance } from "#src/services/genshinParity/sky/getLuminance";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The quantiles the two sets of cloud pixels are paired at, and the share of each set read round each one
const QUANTILES = Array.from({ length: 19 }, (_value, index) => (index + 1) / 20);
const QUANTILE_WINDOW = 0.025;
const computeWindow = <T>(values: readonly T[], quantile: number): T[] => {
  const half = Math.max(Math.round(values.length * QUANTILE_WINDOW), 1);
  const middle = Math.min(Math.floor(values.length * quantile), values.length - 1);
  return values.slice(Math.max(middle - half, 0), middle + half + 1);
};
const computeMean = (vectors: readonly Readonly<Vector>[]): Vector =>
  CHANNELS.map((channel) => vectors.reduce((sum, vector) => sum + vector[channel], 0) / vectors.length) as Vector;
// The clouds' shaded and lit colours that best turn ours into the reference's, in the scene's own colour, where the two
// Skies' clouds stand in different places: each of ours is the sky behind it plus its share of the shaded colour plus
// Its share of the lit one (read by drawing them black and white in turn), so ours ordered by how lit they are and the
// Reference's by how bright they are are paired quantile by quantile, each the mean of the pixels round it, and each
// Channel of the reference's is linear in the two colours, solved by least squares. The residual is the root mean
// Square over the quantiles and channels
export const solveCloudColors = (
  ours: readonly { base: Vector; lit: Vector; shade: Vector }[],
  reference: readonly Vector[],
): { lit: Vector; residual: number; shade: Vector } => {
  if (ours.length === 0 || reference.length === 0)
    throw new InvalidOperationError(
      Operation.Read,
      solveCloudColors.name,
      `no cloud pixels to match: ${ours.length} of ours, ${reference.length} of the reference's`,
    );
  const getLitness = ({ lit, shade }: (typeof ours)[number]): number =>
    getLuminance(lit) / Math.max(getLuminance(lit) + getLuminance(shade), Number.MIN_VALUE);
  const orderedOurs = ours.toSorted((firstCloud, secondCloud) => getLitness(firstCloud) - getLitness(secondCloud));
  const orderedReference = reference.toSorted(
    (firstReferenceColor, secondReferenceColor) =>
      getLuminance(firstReferenceColor) - getLuminance(secondReferenceColor),
  );
  const pairs = QUANTILES.map((quantile) => {
    const window = computeWindow(orderedOurs, quantile);
    return {
      base: computeMean(window.map(({ base }) => base)),
      lit: computeMean(window.map(({ lit }) => lit)),
      reference: computeMean(computeWindow(orderedReference, quantile)),
      shade: computeMean(window.map(({ shade }) => shade)),
    };
  });
  const solved = CHANNELS.map((channel) => {
    const rows = pairs.map(({ lit, shade }) => [shade[channel], lit[channel]]);
    const targets = pairs.map(({ base, reference: color }) => color[channel] - base[channel]);
    const normal = [0, 1].map((row) =>
      [0, 1].map((column) => rows.reduce((sum, values) => sum + (values[row] ?? 0) * (values[column] ?? 0), 0)),
    );
    const right = [0, 1].map((row) =>
      rows.reduce((sum, values, index) => sum + (values[row] ?? 0) * (targets[index] ?? 0), 0),
    );
    return solveLinearSystem(normal, right) ?? [0, 0];
  });
  const shade = CHANNELS.map((channel) => solved[channel]?.[0] ?? 0) as Vector;
  const lit = CHANNELS.map((channel) => solved[channel]?.[1] ?? 0) as Vector;
  let squared = 0;
  for (const { base, lit: litWeight, reference: color, shade: shadeWeight } of pairs)
    for (const channel of CHANNELS)
      squared +=
        (base[channel] + shadeWeight[channel] * shade[channel] + litWeight[channel] * lit[channel] - color[channel]) **
        2;
  return { lit, residual: Math.sqrt(squared / (pairs.length * CHANNELS.length)), shade };
};

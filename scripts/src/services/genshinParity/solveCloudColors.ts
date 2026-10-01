import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

type Vector = [number, number, number];
const CHANNELS = [0, 1, 2] as const;
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
// The quantiles the two sets of cloud pixels are paired at, and the share of each set read round each one
const QUANTILES = Array.from({ length: 19 }, (_, index) => (index + 1) / 20);
const QUANTILE_WINDOW = 0.025;
const readLuminance = (color: Readonly<Vector>): number =>
  CHANNELS.reduce((sum: number, channel) => sum + LUMINANCE[channel] * color[channel], 0);
// The clouds' shaded and lit colours that best turn ours into the reference's, in the scene's own colour, where the two
// Skies' clouds stand in different places: each of ours is the sky behind it plus its share of the shaded colour plus its
// Share of the lit one (read by drawing them black and white in turn), so ours ordered by how lit they are and the
// Reference's by how bright they are are paired quantile by quantile, each the mean of the pixels round it, and each
// Channel of the reference's is linear in the two colours, solved by least squares. The residual is the root mean
// Square over the quantiles and channels
export const solveCloudColors = (
  ours: readonly { base: Vector; lit: Vector; shade: Vector }[],
  reference: readonly Vector[],
): { lit: Vector; residual: number; shade: Vector } => {
  const readLitness = ({ lit, shade }: (typeof ours)[number]): number =>
    readLuminance(lit) / Math.max(readLuminance(lit) + readLuminance(shade), Number.MIN_VALUE);
  const orderedOurs = ours.toSorted((first, second) => readLitness(first) - readLitness(second));
  const orderedReference = reference.toSorted((first, second) => readLuminance(first) - readLuminance(second));
  const readWindow = <T>(values: readonly T[], quantile: number): T[] => {
    const half = Math.max(Math.round(values.length * QUANTILE_WINDOW), 1);
    const middle = Math.min(Math.floor(values.length * quantile), values.length - 1);
    return values.slice(Math.max(middle - half, 0), middle + half + 1);
  };
  const readMean = (vectors: readonly Readonly<Vector>[]): Vector =>
    CHANNELS.map((channel) => vectors.reduce((sum, vector) => sum + vector[channel], 0) / vectors.length) as Vector;
  const pairs = QUANTILES.map((quantile) => {
    const window = readWindow(orderedOurs, quantile);
    return {
      base: readMean(window.map(({ base }) => base)),
      lit: readMean(window.map(({ lit }) => lit)),
      reference: readMean(readWindow(orderedReference, quantile)),
      shade: readMean(window.map(({ shade }) => shade)),
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

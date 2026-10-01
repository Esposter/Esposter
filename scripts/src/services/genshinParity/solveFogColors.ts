import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

type Vector = [number, number, number];
const CHANNELS = [0, 1, 2] as const;
// The sunward colour is settled only where the points looking toward the sun weigh at least this share of the rest
const MIN_SCATTER_WEIGHT_SHARE = 0.001;
// The fog's two colours that best turn each point's clear colour into the reference's, in the scene's own colour: a
// Point a fog of opacity f hides is its clear colour times 1 - f plus the fog's colour times f, the fog's colour its
// Own mixed toward its sunward one by the point's scatter weight s, so each channel of the reference less the clear
// Colour's share is linear in the two, f(1 - s) times the one and fs times the other, solved by least squares channel
// By channel, each point weighted by its weight. Where no point looks toward the sun the sunward colour is unsettled and
// Left the fog's own. The residual is the weighted root mean square over the points and channels
export const solveFogColors = (
  samples: readonly { clear: Vector; opacity: number; reference: Vector; scatter: number; weight: number }[],
): { color: Vector; residual: number; scatterColor: Vector } => {
  const solved = CHANNELS.map((channel) => {
    const rows = samples.map(({ opacity, scatter }) => [opacity * (1 - scatter), opacity * scatter]);
    const weights = samples.map(({ weight }) => weight);
    const targets = samples.map(({ clear, opacity, reference }) => reference[channel] - clear[channel] * (1 - opacity));
    const normal = [0, 1].map((row) =>
      [0, 1].map((column) =>
        rows.reduce(
          (sum, values, index) => sum + (weights[index] ?? 0) * (values[row] ?? 0) * (values[column] ?? 0),
          0,
        ),
      ),
    );
    const right = [0, 1].map((row) =>
      rows.reduce((sum, values, index) => sum + (weights[index] ?? 0) * (values[row] ?? 0) * (targets[index] ?? 0), 0),
    );
    const both =
      (normal[1]?.[1] ?? 0) > (normal[0]?.[0] ?? 0) * MIN_SCATTER_WEIGHT_SHARE
        ? solveLinearSystem(normal, right)
        : undefined;
    if (both) return both;
    // Only the fog's own colour is seen
    const own = (right[0] ?? 0) / ((normal[0]?.[0] ?? 0) || 1);
    return [own, own];
  });
  const color = CHANNELS.map((channel) => solved[channel]?.[0] ?? 0) as Vector;
  const scatterColor = CHANNELS.map((channel) => solved[channel]?.[1] ?? 0) as Vector;
  let [squared, totalWeight] = [0, 0];
  for (const { clear, opacity, reference, scatter, weight } of samples)
    for (const channel of CHANNELS) {
      const fog = color[channel] * (1 - scatter) + scatterColor[channel] * scatter;
      squared += weight * (clear[channel] * (1 - opacity) + fog * opacity - reference[channel]) ** 2;
      totalWeight += weight;
    }
  return { color, residual: Math.sqrt(squared / Math.max(totalWeight, Number.MIN_VALUE)), scatterColor };
};

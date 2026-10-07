import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";

// The sunward colour is settled only where the points looking toward the sun weigh at least this share of the rest
const MIN_SCATTER_WEIGHT_SHARE = 0.001;
// The fog's two colours that best turn each point's lit colour into the reference's, in the scene's own colour: a point
// A fog of opacity f hides is its lit colour times 1 - f plus the fog's colour times f, the fog's colour its own mixed
// Toward its sunward one by the point's scatter weight s. Each channel of the reference is linear in the two colours,
// Solved by least squares channel by channel, each point weighted by its weight and by the tone curve's slope at its
// Reference (`getToneSlope`), so the solve is of what the screen shows to first order. Where no point looks toward the
// Sun the sunward colour is unsettled and left the fog's own. The residual is the weighted root mean square over the
// Points and channels, as the screen shows them
export const solveFogColors = (
  samples: readonly {
    lit: Vector;
    opacity: number;
    reference: Vector;
    scatter: number;
    slope: Vector;
    weight: number;
  }[],
): { color: Vector; residual: number; scatterColor: Vector } => {
  const totalScatterWeight = samples.reduce(
    (sum, { opacity, scatter, weight }) => sum + weight * (opacity * scatter) ** 2,
    0,
  );
  const totalOwnWeight = samples.reduce(
    (sum, { opacity, scatter, weight }) => sum + weight * (opacity * (1 - scatter)) ** 2,
    0,
  );
  const isScatterSettled = totalScatterWeight > totalOwnWeight * MIN_SCATTER_WEIGHT_SHARE;
  const solved = CHANNELS.map((channel) => {
    const rows = samples.map(({ opacity, scatter }) =>
      isScatterSettled ? [opacity * (1 - scatter), opacity * scatter] : [opacity],
    );
    const targets = samples.map(({ lit, opacity, reference }) => reference[channel] - lit[channel] * (1 - opacity));
    const emphases = samples.map(({ slope, weight }) => weight * slope[channel] ** 2);
    const indices = Array.from({ length: rows[0]?.length ?? 0 }, (_value, index) => index);
    const normal = indices.map((row) =>
      indices.map((column) =>
        rows.reduce(
          (sum, values, index) => sum + (emphases[index] ?? 0) * (values[row] ?? 0) * (values[column] ?? 0),
          0,
        ),
      ),
    );
    const right = indices.map((row) =>
      rows.reduce((sum, values, index) => sum + (emphases[index] ?? 0) * (values[row] ?? 0) * (targets[index] ?? 0), 0),
    );
    const [own = 0, sunward = own] = solveLinearSystem(normal, right) ?? [];
    return { color: own, scatterColor: sunward };
  });
  const color = CHANNELS.map((channel) => solved[channel]?.color ?? 0) as Vector;
  const scatterColor = CHANNELS.map((channel) => solved[channel]?.scatterColor ?? 0) as Vector;
  let [squared, totalWeight] = [0, 0];
  for (const { lit, opacity, reference, scatter, slope, weight } of samples)
    for (const channel of CHANNELS) {
      const fog = color[channel] * (1 - scatter) + scatterColor[channel] * scatter;
      squared += weight * (slope[channel] * (lit[channel] * (1 - opacity) + fog * opacity - reference[channel])) ** 2;
      totalWeight += weight;
    }
  return { color, residual: Math.sqrt(squared / Math.max(totalWeight, Number.MIN_VALUE)), scatterColor };
};

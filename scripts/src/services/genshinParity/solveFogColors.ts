import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

type Vector = [number, number, number];
const CHANNELS = [0, 1, 2] as const;
// The sunward colour is settled only where the points looking toward the sun weigh at least this share of the rest
const MIN_SCATTER_WEIGHT_SHARE = 0.001;
// The fog's two colours, and when asked the shares of the lights a point is lit by, that best turn each point's lit
// Colour into the reference's, in the scene's own colour: a point a fog of opacity f hides is its lit colour times
// 1 - f plus the fog's colour times f, the fog's colour its own mixed toward its sunward one by the point's scatter
// Weight s. Its lit colour is the sum of its lights' (ours drawn under each light alone), each scaled by that light's
// Share where the shares are solved and as drawn where not, so each channel of the reference is linear in the shares
// And the two colours, solved by least squares channel by channel, each point weighted by its weight. Where no point
// Looks toward the sun the sunward colour is unsettled and left the fog's own. The residual is the weighted root mean
// Square over the points and channels
export const solveFogColors = (
  samples: readonly { lights: Vector[]; opacity: number; reference: Vector; scatter: number; weight: number }[],
  { isLightSolved = false }: { isLightSolved?: boolean } = {},
): { color: Vector; residual: number; scatterColor: Vector; shares: Vector[] } => {
  const lightCount = isLightSolved ? (samples[0]?.lights.length ?? 0) : 0;
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
    const rows = samples.map(({ lights, opacity, scatter }) => [
      ...lights.slice(0, lightCount).map((light) => light[channel] * (1 - opacity)),
      isScatterSettled ? opacity * (1 - scatter) : opacity,
      ...(isScatterSettled ? [opacity * scatter] : []),
    ]);
    const targets = samples.map(
      ({ lights, opacity, reference }) =>
        reference[channel] -
        (isLightSolved ? 0 : lights.reduce((sum, light) => sum + light[channel], 0) * (1 - opacity)),
    );
    const size = rows[0]?.length ?? 0;
    const indices = Array.from({ length: size }, (_, index) => index);
    const normal = indices.map((row) =>
      indices.map((column) =>
        rows.reduce(
          (sum, values, index) => sum + (samples[index]?.weight ?? 0) * (values[row] ?? 0) * (values[column] ?? 0),
          0,
        ),
      ),
    );
    const right = indices.map((row) =>
      rows.reduce(
        (sum, values, index) => sum + (samples[index]?.weight ?? 0) * (values[row] ?? 0) * (targets[index] ?? 0),
        0,
      ),
    );
    const solution = solveLinearSystem(normal, right) ?? indices.map(() => 0);
    const own = solution[lightCount] ?? 0;
    return {
      color: own,
      scatterColor: isScatterSettled ? (solution[lightCount + 1] ?? own) : own,
      shares: solution.slice(0, lightCount),
    };
  });
  const color = CHANNELS.map((channel) => solved[channel]?.color ?? 0) as Vector;
  const scatterColor = CHANNELS.map((channel) => solved[channel]?.scatterColor ?? 0) as Vector;
  const shares = Array.from(
    { length: lightCount },
    (_, light) => CHANNELS.map((channel) => solved[channel]?.shares[light] ?? 1) as Vector,
  );
  let [squared, totalWeight] = [0, 0];
  for (const { lights, opacity, reference, scatter, weight } of samples)
    for (const channel of CHANNELS) {
      const lit = lights.reduce(
        (sum, light, index) => sum + light[channel] * (isLightSolved ? (shares[index]?.[channel] ?? 1) : 1),
        0,
      );
      const fog = color[channel] * (1 - scatter) + scatterColor[channel] * scatter;
      squared += weight * (lit * (1 - opacity) + fog * opacity - reference[channel]) ** 2;
      totalWeight += weight;
    }
  return { color, residual: Math.sqrt(squared / Math.max(totalWeight, Number.MIN_VALUE)), scatterColor, shares };
};

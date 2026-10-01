import { applyGradeCurve } from "#src/services/genshinParity/applyGradeCurve";
import { fitMonotone } from "#src/services/genshinParity/fitMonotone";
import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

// How many knots a channel's curve has, spread evenly over its input from 0 to 1
const KNOT_COUNT = 17;
// One channel's grade as a curve from a value predicted before the grade to the value the reference shows, by least
// Squares over the knots of a piecewise linear curve, each sample shared between the two knots around it, then made
// Monotone as a grade is. Returns the knots' outputs and the root mean square residual
export const fitGradeCurve = (
  samples: readonly { from: number; to: number }[],
): { knots: number[]; residual: number } => {
  const segment = 1 / (KNOT_COUNT - 1);
  const normal = Array.from({ length: KNOT_COUNT }, () => Array.from({ length: KNOT_COUNT }, () => 0));
  const right = Array.from({ length: KNOT_COUNT }, () => 0);
  const addWeight = (row: number, column: number, value: number): void => {
    const target = normal[row];
    if (target) target[column] = (target[column] ?? 0) + value;
  };
  for (const { from, to } of samples) {
    const position = Math.min(Math.max(from, 0), 1) / segment;
    const lower = Math.min(Math.floor(position), KNOT_COUNT - 2);
    const share = position - lower;
    const weights: [number, number][] = [
      [lower, 1 - share],
      [lower + 1, share],
    ];
    for (const [row, rowWeight] of weights) {
      right[row] = (right[row] ?? 0) + rowWeight * to;
      for (const [column, columnWeight] of weights) addWeight(row, column, rowWeight * columnWeight);
    }
  }
  // A knot no sample reaches is held to its neighbours by a light smoothness term, and every knot drawn faintly toward
  // The identity, so the system stays solvable where the samples leave a stretch of the curve empty
  const SMOOTHNESS = 1e-3;
  const IDENTITY_PULL = 1e-4;
  for (let knot = 0; knot < KNOT_COUNT; knot++) {
    addWeight(knot, knot, IDENTITY_PULL);
    right[knot] = (right[knot] ?? 0) + IDENTITY_PULL * knot * segment;
  }
  for (let knot = 1; knot < KNOT_COUNT - 1; knot++)
    for (const [column, value] of [
      [knot - 1, -1],
      [knot, 2],
      [knot + 1, -1],
    ] as const)
      addWeight(knot, column, SMOOTHNESS * value);

  // Monotone, the nearest falling nowhere, each knot weighted by the samples it carries
  const solved = fitMonotone(
    solveLinearSystem(normal, right) ?? right.map(() => 0),
    normal.map((row, knot) => row[knot] ?? 0),
  );
  let squared = 0;
  for (const { from, to } of samples) squared += (applyGradeCurve(solved, from) - to) ** 2;
  return { knots: solved, residual: Math.sqrt(squared / Math.max(samples.length, 1)) };
};

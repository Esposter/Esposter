import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";

// How far the residual's slope toward an unknown held at none must rise before it is freed, against the slope's scale,
// So rounding alone frees nothing
const RELATIVE_TOLERANCE = 1e-10;
// The solution, none of it negative, minimising a quadratic's residual `x·Ax − 2 x·r`, the normal equations of a least
// Squares, by Lawson and Hanson's active set: every unknown starts held at none, and the one whose freeing lowers the
// Residual fastest is freed and the free ones solved exactly; a free unknown that would turn negative is walked back to
// None and held there again. An unknown that only worsens the fit is held at none rather than left negative, or
// Clamped after a free solve, which leaves the unknowns it cancelled too large. Each step lowers the residual, so a set
// Of free unknowns never repeats and the walk ends at the one least residual, as every subset tried would find
export const solveNonNegativeSystem = (gram: number[][], right: number[]): number[] => {
  const size = right.length;
  const solution = right.map(() => 0);
  const isFree = right.map(() => false);
  const scale = Math.max(...right.map((value) => Math.abs(value)), Number.EPSILON);
  // Half the residual's slope at the solution, toward each unknown rising
  const computeSlope = (unknown: number): number =>
    (right[unknown] ?? 0) - solution.reduce((sum, value, other) => sum + (gram[unknown]?.[other] ?? 0) * value, 0);
  // The free unknowns solved exactly with the rest held at none
  const solveFree = (): number[] => {
    const free = solution.flatMap((_value, unknown) => (isFree[unknown] ? [unknown] : []));
    const solved =
      solveLinearSystem(
        free.map((row) => free.map((column) => gram[row]?.[column] ?? 0)),
        free.map((unknown) => right[unknown] ?? 0),
      ) ?? free.map(() => 0);
    const trial = right.map(() => 0);
    for (const [index, unknown] of free.entries()) trial[unknown] = solved[index] ?? 0;
    return trial;
  };
  for (let step = 0; step < 3 * size; step++) {
    let freed = -1;
    let steepest = RELATIVE_TOLERANCE * scale;
    for (let unknown = 0; unknown < size; unknown++) {
      if (isFree[unknown]) continue;
      const slope = computeSlope(unknown);
      if (slope <= steepest) continue;
      freed = unknown;
      steepest = slope;
    }
    if (freed < 0) break;
    isFree[freed] = true;
    for (let inner = 0; inner < size; inner++) {
      const trial = solveFree();
      if (trial.every((value, unknown) => !isFree[unknown] || value > 0)) {
        for (const [unknown, value] of trial.entries()) solution[unknown] = value;
        break;
      }
      // Walk toward the trial until the first free unknown reaches none, and hold every one that has
      let share = 1;
      for (const [unknown, value] of trial.entries())
        if (isFree[unknown] && value <= 0) {
          const current = solution[unknown] ?? 0;
          share = Math.min(share, current / (current - value || 1));
        }
      for (const [unknown, value] of trial.entries()) {
        const current = solution[unknown] ?? 0;
        solution[unknown] = current + share * (value - current);
        if (isFree[unknown] && (solution[unknown] ?? 0) <= RELATIVE_TOLERANCE * scale) {
          isFree[unknown] = false;
          solution[unknown] = 0;
        }
      }
    }
  }
  return solution;
};

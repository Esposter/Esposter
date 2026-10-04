import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

// The solution, none of it negative, minimising a quadratic's residual `x·Ax − 2 x·r`, the normal equations of a least
// Squares: every subset of the unknowns is solved exactly with the rest held at none, and the feasible solution with
// The least residual kept, so an unknown that only worsens the fit is held at none rather than left negative, or
// Clamped after a free solve, which leaves the unknowns it cancelled too large. A handful of unknowns make a handful
// Of subsets
export const solveNonNegativeSystem = (gram: number[][], rhs: number[]): number[] => {
  let best = { residual: 0, solution: rhs.map(() => 0) };
  for (let subset = 1; subset < 2 ** rhs.length; subset++) {
    const unknowns = rhs.flatMap((_, unknown) => ((subset >> unknown) & 1 ? [unknown] : []));
    const solved = solveLinearSystem(
      unknowns.map((row) => unknowns.map((column) => gram[row]?.[column] ?? 0)),
      unknowns.map((unknown) => rhs[unknown] ?? 0),
    );
    if (!solved?.every((value) => value >= 0)) continue;
    const solution = rhs.map(() => 0);
    for (const [index, unknown] of unknowns.entries()) solution[unknown] = solved[index] ?? 0;
    // At the exact solution of a subset its residual is the negated product of its values with the right-hand side
    const residual = -solution.reduce((sum, value, unknown) => sum + value * (rhs[unknown] ?? 0), 0);
    if (residual < best.residual) best = { residual, solution };
  }
  return best.solution;
};

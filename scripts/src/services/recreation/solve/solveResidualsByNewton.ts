/* oxlint-disable no-await-in-loop -- One device: each residual is a render that must finish before the next begins,
   as parallel renders exhaust the memory each holds */
import { solveLinearSystem } from "#src/services/recreation/solve/solveLinearSystem";

// The finite difference steps an unknown by this fraction of its size, unless the caller gives that unknown a step
const DEFAULT_RELATIVE_STEP = 0.02;
// An unknown at none is still taken as this size, so its finite difference never steps by zero
const SMALLEST_SIZE = 1e-8;
// The damping a solve starts at, multiplied by the factor when a step is refused and divided by it when one is accepted
const INITIAL_DAMPING = 1e-3;
const DAMPING_FACTOR = 10;
// The dampings tried from one point before the solve stops there, a singular system counting as a refused step
const MAX_ATTEMPTS = 10;
// An accepted step this small, each unknown measured against its own size, means the solve has stalled
const STEP_TOLERANCE = 1e-12;

// The options a solve takes beyond its residuals, start, tolerance and iteration limit
export interface NewtonOptions {
  // The floor each unknown is held at or above, so no proposed point lies below it, none when not given
  lowerBounds?: readonly number[];
  // The fraction of its size each unknown is stepped by in its finite difference, 0.02 for every unknown when not given
  relativeSteps?: readonly number[];
}

// Where a solve stopped, the residuals there, and how many accepted steps it took to get there
export interface NewtonResult {
  converged: boolean;
  iterations: number;
  residuals: number[];
  solution: number[];
}

// A step that lowered the cost, with the damping it was taken at and the point and residuals it reached
interface AcceptedStep {
  cost: number;
  damping: number;
  point: number[];
  residuals: number[];
}

// The dot product of two vectors, a missing entry of the second counting as zero
const dot = (first: readonly number[], second: readonly number[]): number =>
  first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);

// The largest magnitude among a vector's entries, the max-norm the stopping tests read
const maxAbs = (values: readonly number[]): number => Math.max(0, ...values.map((value) => Math.abs(value)));

// The largest move from one point to another, each unknown's move measured against that unknown's own size
const relativeMove = (from: readonly number[], to: readonly number[]): number =>
  maxAbs(to.map((value, index) => (value - (from[index] ?? 0)) / Math.max(Math.abs(from[index] ?? 0), SMALLEST_SIZE)));

// The point at which the residuals vanish, found by a damped Gauss-Newton step (Levenberg-Marquardt).
// Each step solves the normal equations with their diagonal scaled up by the damping.
// The slopes come from forward differences, since the residuals are only ever read as a function.
// A step is taken only when it lowers the sum of squared residuals.
// A damping that grows on each refusal walks a poor start downhill.
// Each residual is awaited in turn, since one render must finish before the next begins.
export const solveResidualsByNewton = async (
  residuals: (unknowns: number[]) => number[] | Promise<number[]>,
  start: readonly number[],
  tolerance: number,
  maxIterations: number,
  options: NewtonOptions = {},
): Promise<NewtonResult> => {
  const { lowerBounds = [], relativeSteps = [] } = options;
  // A proposed point is held at or above each unknown's floor, so the residuals are never read below it
  const clamp = (unknowns: readonly number[]): number[] =>
    unknowns.map((value, index) => Math.max(value, lowerBounds[index] ?? Number.NEGATIVE_INFINITY));
  // Each read gets its own copy, so the residuals cannot change the point the solve holds
  const evaluate = async (unknowns: readonly number[]): Promise<number[]> => residuals([...unknowns]);
  // The slope of each residual along each unknown, one column per unknown.
  // Each is a forward difference at that unknown's own step.
  const slopesAt = async (point: readonly number[], current: readonly number[]): Promise<number[][]> => {
    const slopes: number[][] = [];
    for (const [index, value] of point.entries()) {
      const step = (relativeSteps[index] ?? DEFAULT_RELATIVE_STEP) * Math.max(Math.abs(value), SMALLEST_SIZE);
      const moved = await evaluate(point.map((other, otherIndex) => (otherIndex === index ? other + step : other)));
      slopes.push(current.map((residual, row) => ((moved[row] ?? 0) - residual) / step));
    }
    return slopes;
  };
  // The first step from the point that lowers the cost, or undefined when no attempt does.
  // Each attempt uses a larger damping, and a singular damped system refuses its attempt like any other.
  const findStep = async (
    point: readonly number[],
    current: readonly number[],
    cost: number,
    slopes: number[][],
    damping: number,
  ): Promise<AcceptedStep | undefined> => {
    const normal = slopes.map((row) => slopes.map((column) => dot(row, column)));
    const gradient = slopes.map((row) => -dot(row, current));
    let attemptDamping = damping;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const scale = 1 + attemptDamping;
      const damped = normal.map((row, index) => row.map((value, other) => (index === other ? value * scale : value)));
      const step = solveLinearSystem(damped, gradient);
      if (step) {
        const candidate = clamp(point.map((value, index) => value + (step[index] ?? 0)));
        const candidateResiduals = await evaluate(candidate);
        const candidateCost = dot(candidateResiduals, candidateResiduals);
        if (candidateCost < cost)
          return { cost: candidateCost, damping: attemptDamping, point: candidate, residuals: candidateResiduals };
      }
      attemptDamping *= DAMPING_FACTOR;
    }
    return undefined;
  };
  let solution = clamp(start);
  let current = await evaluate(solution);
  let cost = dot(current, current);
  let damping = INITIAL_DAMPING;
  let iterations = 0;
  while (iterations < maxIterations && maxAbs(current) > tolerance) {
    const slopes = await slopesAt(solution, current);
    const accepted = await findStep(solution, current, cost, slopes, damping);
    if (!accepted) break;
    const move = relativeMove(solution, accepted.point);
    solution = accepted.point;
    current = accepted.residuals;
    cost = accepted.cost;
    damping = accepted.damping / DAMPING_FACTOR;
    iterations++;
    if (move <= STEP_TOLERANCE) break;
  }
  return { converged: maxAbs(current) <= tolerance, iterations, residuals: current, solution };
};

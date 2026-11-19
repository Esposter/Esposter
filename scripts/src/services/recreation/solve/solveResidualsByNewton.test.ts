import { solveResidualsByNewton } from "#src/services/recreation/solve/solveResidualsByNewton";
import { describe, expect, test } from "vitest";

// One per-term update: each target is scaled by its own ratio of reference to measured.
// It ignores how the outputs couple to one another.
const updatePerTerm = (
  targets: readonly number[],
  measured: readonly number[],
  reference: readonly number[],
): number[] => targets.map((target, index) => (target * (reference[index] ?? 0)) / (measured[index] ?? 0));

describe(solveResidualsByNewton, () => {
  // The solution the response is built around, one value per unknown.
  // The finest band, two more bands, a level, and the variance.
  const solved = { finest: 2.5e-3, fourth: 0.25, second: 0.12, third: 0.6, variance: 1.5e-3 };
  const solution = [solved.finest, solved.second, solved.third, solved.fourth, solved.variance];
  // Each output is its unknown plus a coupling that vanishes at the solution, or a weak power term that does too.
  // The finest band (output 0) rises as the variance (unknown 4) falls, and output 4 falls as the finest band rises.
  // So a per-term update cycles between the two instead of settling.
  const measure = ([finest = 0, second = 0, third = 0, fourth = 0, variance = 0]: readonly number[]): number[] => [
    finest + 1.5 * (solved.variance - variance),
    second + 0.4 * (finest - solved.finest),
    third * (fourth / solved.fourth) ** 0.25,
    fourth + 0.3 * (second - solved.second),
    variance + (solved.finest - finest),
  ];
  // The outputs at the solution, which the response reads back as the reference
  const reference = measure(solution);
  // The start every solve begins from, each unknown off the solution by its own factor
  const start = [2.75e-3, 0.108, 0.63, 0.2375, 1.8e-3];
  // Each output's relative miss against its reference, so the residuals are of one size whatever the output's unit
  const residuals = (unknowns: number[]): number[] => {
    const outputs = measure(unknowns);
    return reference.map((target, index) => ((outputs[index] ?? 0) - target) / target);
  };

  test("a per-term update fails on a coupled response", () => {
    expect.hasAssertions();

    let targets = start;
    for (let iteration = 0; iteration < 60; iteration++) targets = updatePerTerm(targets, measure(targets), reference);

    expect(Math.max(...residuals(targets).map((residual) => Math.abs(residual)))).toBeGreaterThan(0.05);
  });

  test("the Newton solver converges on the coupled response", async () => {
    expect.hasAssertions();

    const result = await solveResidualsByNewton(residuals, start, 1e-6, 50);
    const relativeErrors = solution.map((value, index) => Math.abs((result.solution[index] ?? 0) - value) / value);

    expect(result.converged).toBe(true);
    expect(Math.max(...relativeErrors)).toBeLessThan(1e-4);
  });

  test("a flat, already-solved start returns at once", async () => {
    expect.hasAssertions();

    const result = await solveResidualsByNewton(residuals, solution, 1e-6, 50);

    expect(result.iterations).toBe(0);
    expect(result.converged).toBe(true);
    expect(result.solution).toStrictEqual(solution);
  });

  test("a singular Jacobian does not throw", async () => {
    expect.hasAssertions();

    const result = await solveResidualsByNewton(() => [1, 1, 1, 1, 1], start, 1e-6, 50);

    expect(result.converged).toBe(false);
  });
});

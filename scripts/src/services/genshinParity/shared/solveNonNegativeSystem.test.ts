import { solveNonNegativeSystem } from "#src/services/genshinParity/shared/solveNonNegativeSystem";
import { describe, expect, test } from "vitest";

describe(solveNonNegativeSystem, () => {
  test("solves the system exactly when nothing is negative", () => {
    expect.hasAssertions();

    expect(
      solveNonNegativeSystem(
        [
          [1, 0],
          [0, 1],
        ],
        [2, 3],
      ),
    ).toStrictEqual([2, 3]);
  });

  test("holds at none an unknown that would be negative", () => {
    expect.hasAssertions();

    expect(
      solveNonNegativeSystem(
        [
          [1, 0],
          [0, 1],
        ],
        [2, -3],
      ),
    ).toStrictEqual([2, 0]);
  });

  test("solves the rest again once an unknown is held at none", () => {
    expect.hasAssertions();

    // Free, the system solves to 2 and -1; clamped after, the first stays 2, where held at none it solves to 1
    expect(
      solveNonNegativeSystem(
        [
          [1, 1],
          [1, 2],
        ],
        [1, 0],
      ),
    ).toStrictEqual([1, 0]);
  });

  test("reaches the least residual over more unknowns than every subset could be tried for", () => {
    expect.hasAssertions();

    // Forty unknowns read by sixty rows of a fixed scatter, toward a target some of them can only reach below none
    const size = 40;
    const rows = Array.from({ length: 60 }, (_row, row) =>
      Array.from(
        { length: size },
        (_value, unknown) => Math.sin(row * 1.7 + unknown * 2.3) + Math.cos(row * unknown * 0.3),
      ),
    );
    const target = rows.map((_row, row) => Math.sin(row * 0.9) * 3);
    const gram = Array.from({ length: size }, (_first, first) =>
      Array.from({ length: size }, (_second, second) =>
        rows.reduce((sum, row) => sum + (row[first] ?? 0) * (row[second] ?? 0), 0),
      ),
    );
    const right = Array.from({ length: size }, (_value, unknown) =>
      rows.reduce((sum, row, index) => sum + (row[unknown] ?? 0) * (target[index] ?? 0), 0),
    );
    const solution = solveNonNegativeSystem(gram, right);
    // At the least residual no unknown is negative, a free one's slope is none and a held one's would only worsen it
    const slopes = right.map(
      (value, unknown) =>
        value - solution.reduce((sum, other, index) => sum + (gram[unknown]?.[index] ?? 0) * other, 0),
    );

    const freeSlopes = slopes.filter((_slope, unknown) => (solution[unknown] ?? 0) > 0);
    const heldSlopes = slopes.filter((_slope, unknown) => solution[unknown] === 0);

    expect(Math.min(...solution)).toBeGreaterThanOrEqual(0);
    expect(heldSlopes.length).toBeGreaterThan(0);
    expect(Math.max(...freeSlopes.map((slope) => Math.abs(slope)))).toBeLessThan(1e-6);
    expect(Math.max(...heldSlopes)).toBeLessThan(1e-6);
  });
});

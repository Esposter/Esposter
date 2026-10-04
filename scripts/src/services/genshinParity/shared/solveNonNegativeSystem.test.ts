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
});

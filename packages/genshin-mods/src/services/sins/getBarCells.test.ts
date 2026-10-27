import { describe, expect, test } from "vitest";

import { getBarCells } from "./getBarCells";

describe(getBarCells, () => {
  test("reaches the score solid and the spread tinted", () => {
    expect.hasAssertions();

    expect(getBarCells({ score: 0.62, spread: 0.09 }, 20)).toStrictEqual({ solid: 12, tinted: 2 });
  });

  test("draws no solid cells for a score of none", () => {
    expect.hasAssertions();

    expect(getBarCells({ score: 0, spread: 0 }, 20)).toStrictEqual({ solid: 0, tinted: 0 });
  });
});

import { computeLevelReached } from "#src/services/shared/computeLevelReached";
import { describe, expect, test } from "vitest";

describe(computeLevelReached, () => {
  const LEVELS: { exp: number }[] = [{ exp: 0 }, { exp: 10 }, { exp: 30 }];

  test("should read the level whose EXP is reached, and never past the top level", () => {
    expect.hasAssertions();

    expect([0, 9, 10, 29, 30, 40].map((exp) => computeLevelReached(exp, LEVELS))).toStrictEqual([1, 1, 2, 2, 3, 3]);
  });
});

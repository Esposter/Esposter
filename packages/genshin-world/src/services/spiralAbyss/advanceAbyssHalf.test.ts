import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

import { advanceAbyssHalf } from "#src/services/spiralAbyss/advanceAbyssHalf";
import { describe, expect, test } from "vitest";

describe(advanceAbyssHalf, () => {
  const CHALLENGE: AbyssChallenge = { defeatedHalfCount: 0, halfCount: 2, secondsLeft: 300 };

  test("a half advances when its last enemy is defeated", () => {
    expect.hasAssertions();

    expect(advanceAbyssHalf(CHALLENGE, 2)).toBe(CHALLENGE);
    expect(advanceAbyssHalf(CHALLENGE, 0)).toStrictEqual({ ...CHALLENGE, defeatedHalfCount: 1 });
  });

  test("a finished chamber does not advance past its last half", () => {
    expect.hasAssertions();

    const finished: AbyssChallenge = { ...CHALLENGE, defeatedHalfCount: 2 };

    expect(advanceAbyssHalf(finished, 0)).toBe(finished);
  });
});

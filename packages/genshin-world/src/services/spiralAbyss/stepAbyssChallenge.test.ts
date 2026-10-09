import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";
import { defeatAbyssHalf } from "#src/services/spiralAbyss/defeatAbyssHalf";
import { stepAbyssChallenge } from "#src/services/spiralAbyss/stepAbyssChallenge";
import { describe, expect, test } from "vitest";

describe(stepAbyssChallenge, () => {
  const challenge: AbyssChallenge = { defeatedHalfCount: 0, halfCount: 2, monolithPercent: undefined, secondsLeft: 10 };

  test("should run the clock down without taking it below zero", () => {
    expect.hasAssertions();

    expect(stepAbyssChallenge(challenge, 4).secondsLeft).toBe(6);
    expect(stepAbyssChallenge(challenge, 25).secondsLeft).toBe(0);
  });

  test("should carry the time left from one half into the next", () => {
    expect.hasAssertions();

    const firstHalfDefeated = defeatAbyssHalf(stepAbyssChallenge(challenge, 4));

    expect(checkIsAbyssChallengeCleared(firstHalfDefeated)).toBe(false);
    expect(firstHalfDefeated.secondsLeft).toBe(6);
    expect(checkIsAbyssChallengeCleared(defeatAbyssHalf(firstHalfDefeated))).toBe(true);
  });
});

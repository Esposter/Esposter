import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

import { checkIsAbyssChallengeFailed } from "#src/services/spiralAbyss/checkIsAbyssChallengeFailed";
import { describe, expect, test } from "vitest";

describe(checkIsAbyssChallengeFailed, () => {
  const challenge: AbyssChallenge = { defeatedHalfCount: 0, halfCount: 1, monolithPercent: undefined, secondsLeft: 1 };

  test("should fail a chamber whose clock has run out", () => {
    expect.hasAssertions();

    expect(checkIsAbyssChallengeFailed({ ...challenge, secondsLeft: 0 })).toBe(true);
  });

  test("should fail a chamber whose monolith has fallen to no health", () => {
    expect.hasAssertions();

    expect(checkIsAbyssChallengeFailed({ ...challenge, monolithPercent: 0 })).toBe(true);
  });

  test("should not fail a chamber with no monolith while its clock runs", () => {
    expect.hasAssertions();

    expect(checkIsAbyssChallengeFailed(challenge)).toBe(false);
  });

  test("should never fail a chamber that is cleared", () => {
    expect.hasAssertions();

    expect(checkIsAbyssChallengeFailed({ ...challenge, defeatedHalfCount: 1, secondsLeft: 0 })).toBe(false);
  });
});

import { computeDomainChallengeElapsed } from "#src/services/domains/computeDomainChallengeElapsed";
import { describe, expect, test } from "vitest";

describe(computeDomainChallengeElapsed, () => {
  test("a frame with the world open adds its time to the challenge", () => {
    expect.hasAssertions();

    expect(computeDomainChallengeElapsed(1000, 16, true)).toBe(1016);
  });

  test("a frame with a menu open spends none of the time limit", () => {
    expect.hasAssertions();

    expect(computeDomainChallengeElapsed(1000, 16, false)).toBe(1000);
  });
});

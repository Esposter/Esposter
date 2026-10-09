import type { ReputationExplore } from "#src/models/reputation/ReputationExplore";

import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { describe, expect, test } from "vitest";

describe(computeReputationExploresReached, () => {
  const EXPLORES: ReputationExplore[] = [20, 40, 60].map((exploreProgress) => ({
    exploreId: exploreProgress,
    exploreProgress,
    reward: { exp: 200, items: [] },
  }));

  test("should reach a threshold the progress has passed, and no other", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(0, 39, EXPLORES).map(({ exploreId }) => exploreId)).toStrictEqual([20]);
  });

  test("should reach a threshold exactly at its percentage", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(19, 20, EXPLORES).map(({ exploreId }) => exploreId)).toStrictEqual([20]);
  });

  test("should not reach a threshold the previous progress already held", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(40, 60, EXPLORES).map(({ exploreId }) => exploreId)).toStrictEqual([60]);
  });
});

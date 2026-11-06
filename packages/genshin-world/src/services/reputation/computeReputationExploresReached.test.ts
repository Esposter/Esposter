import type { ReputationExplore } from "#src/models/reputation/ReputationExplore";

import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(computeReputationExploresReached, () => {
  const EXPLORES: ReputationExplore[] = [20, 40, 60].map((exploreProgress) => ({
    exploreId: exploreProgress,
    exploreProgress,
    reward: { exp: 200, items: [] },
  }));

  test("Passing an exploration threshold pays once", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(0, 39, EXPLORES)).toStrictEqual([takeOne(EXPLORES, 0)]);
  });

  test("should reach a threshold exactly at its percentage", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(19, 20, EXPLORES)).toStrictEqual([takeOne(EXPLORES, 0)]);
  });

  test("A passed threshold does not pay again", () => {
    expect.hasAssertions();

    expect(computeReputationExploresReached(40, 60, EXPLORES)).toStrictEqual([takeOne(EXPLORES, 2)]);
  });
});

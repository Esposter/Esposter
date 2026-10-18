import type { HomeProgress } from "#src/models/home/HomeProgress";

import { dismissHomeCompanion } from "#src/services/home/dismissHomeCompanion";
import { describe, expect, test } from "vitest";

describe(dismissHomeCompanion, () => {
  const CHARACTER_ID = 10_000_001;
  const OTHER_CHARACTER_ID = 10_000_002;
  const progress: HomeProgress = {
    accruedAt: Temporal.Instant.fromEpochMilliseconds(0),
    claimedRewardIds: [],
    companionIds: [CHARACTER_ID, OTHER_CHARACTER_ID],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };

  test("a dismissed companion leaves the realm", () => {
    expect.hasAssertions();

    expect(dismissHomeCompanion(CHARACTER_ID, progress)).toStrictEqual({
      ...progress,
      companionIds: [OTHER_CHARACTER_ID],
    });
  });
});

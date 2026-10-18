import type { HomeFavour } from "#src/models/home/HomeFavour";
import type { HomeProgress } from "#src/models/home/HomeProgress";

import { giveHomeFavour } from "#src/services/home/giveHomeFavour";
import { describe, expect, test } from "vitest";

describe(giveHomeFavour, () => {
  // Made-up companions, furnishing suite, reward and talk ids
  const COMPANION_ID = 1001;
  const OTHER_COMPANION_ID = 1002;
  const FURNITURE_SUIT_ID = 50;
  const REWARD_ID = 9001;
  const TALK_ID = 7001;
  const favour: HomeFavour = {
    avatarId: COMPANION_ID,
    furnitureSuitId: FURNITURE_SUIT_ID,
    rewardId: REWARD_ID,
    talkId: TALK_ID,
  };
  const progress: HomeProgress = {
    accruedAt: Temporal.Instant.fromEpochMilliseconds(0),
    claimedRewardIds: [],
    companionIds: [COMPANION_ID],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };

  test("a favoured gift set gives the companion's reward once", () => {
    expect.hasAssertions();
    const claimed = { ...progress, claimedRewardIds: [REWARD_ID] };

    expect(giveHomeFavour(favour, progress)).toStrictEqual({ progress: claimed, rewardId: REWARD_ID, talkId: TALK_ID });
    expect(giveHomeFavour(favour, claimed)).toStrictEqual({ progress: claimed, talkId: TALK_ID });
  });

  test("a companion who does not live in the realm gives nothing", () => {
    expect.hasAssertions();

    expect(giveHomeFavour({ ...favour, avatarId: OTHER_COMPANION_ID }, progress)).toBeUndefined();
  });
});

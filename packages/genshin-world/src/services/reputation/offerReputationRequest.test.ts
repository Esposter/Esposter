import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { offerReputationRequest } from "#src/services/reputation/offerReputationRequest";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(offerReputationRequest, () => {
  const REWARD = { exp: 80, items: [{ count: 20_000, id: 202 }] };
  const OFFERABLE_QUEST_IDS = ["901", "902", "903"];
  const CITY: ReputationCity = {
    bounties: [],
    bountyTargets: [],
    explores: [],
    huntingRegions: [],
    levels: [
      { functionIds: [], goodsIds: [], level: 1, nextLevelExp: 10, requestGroupId: 1, reward: REWARD },
      { functionIds: [], goodsIds: [], level: 2, nextLevelExp: 0, requestGroupId: 2, reward: REWARD },
    ],
    quests: [],
    requests: [
      { groupId: 1, questId: 901, requestId: 1001, reward: REWARD, weight: 1 },
      { groupId: 2, questId: 902, requestId: 1002, reward: REWARD, weight: 1 },
      { groupId: 2, questId: 903, requestId: 1003, reward: REWARD, weight: 3 },
    ],
  };
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("a request is not offered before level two", () => {
    expect.hasAssertions();

    expect(offerReputationRequest(CITY, 1, 0, OFFERABLE_QUEST_IDS, [], now)).toBeUndefined();
    expect(offerReputationRequest(CITY, 2, 0, OFFERABLE_QUEST_IDS, [], now)).toStrictEqual(CITY.requests[1]);
  });

  test("a request outside the offerable quests is never drawn", () => {
    expect.hasAssertions();

    expect(offerReputationRequest(CITY, 2, 0.2, ["903"], [], now)).toStrictEqual(CITY.requests[2]);
    expect(offerReputationRequest(CITY, 2, 0.2, [], [], now)).toBeUndefined();
  });

  test("should draw a request in proportion to its weight", () => {
    expect.hasAssertions();

    expect(offerReputationRequest(CITY, 2, 0.2, OFFERABLE_QUEST_IDS, [], now)).toStrictEqual(CITY.requests[1]);
    expect(offerReputationRequest(CITY, 2, 0.5, OFFERABLE_QUEST_IDS, [], now)).toStrictEqual(CITY.requests[2]);
  });

  test("A fourth claim of a kind in the week is refused", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(offerReputationRequest(CITY, 2, 0.2, OFFERABLE_QUEST_IDS, claimedAts, now)).toBeUndefined();
  });
});

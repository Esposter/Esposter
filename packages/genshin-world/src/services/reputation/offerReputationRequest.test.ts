import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { offerReputationRequest } from "#src/services/reputation/offerReputationRequest";
import { describe, expect, test } from "vitest";

describe(offerReputationRequest, () => {
  const REWARD = { exp: 80, items: [{ count: 20_000, id: 202 }] };
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

  test("a request is not offered before level two", () => {
    expect.hasAssertions();

    expect(offerReputationRequest(CITY, 1, 0)).toBeUndefined();
    expect(offerReputationRequest(CITY, 2, 0)).toStrictEqual(CITY.requests[1]);
  });

  test("should draw a request in proportion to its weight", () => {
    expect.hasAssertions();

    expect(offerReputationRequest(CITY, 2, 0.2)).toStrictEqual(CITY.requests[1]);
    expect(offerReputationRequest(CITY, 2, 0.5)).toStrictEqual(CITY.requests[2]);
  });
});

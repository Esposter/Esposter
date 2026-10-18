import { getReputationRequestBindings } from "#src/services/reputation/getReputationRequestBindings";
import { describe, expect, test } from "vitest";

describe(getReputationRequestBindings, () => {
  const FIRST_REWARD = { exp: 80, items: [{ count: 20_000, id: 202 }] };
  const SECOND_REWARD = { exp: 120, items: [{ count: 30_000, id: 202 }] };

  test("a request quest named by more than one group is bound once, to its first row", () => {
    expect.hasAssertions();

    expect(
      getReputationRequestBindings([
        { groupId: 1, questId: 901, requestId: 1001, reward: FIRST_REWARD, weight: 1 },
        { groupId: 5, questId: 901, requestId: 1061, reward: SECOND_REWARD, weight: 1 },
        { groupId: 1, questId: 902, requestId: 1002, reward: FIRST_REWARD, weight: 1 },
      ]),
    ).toStrictEqual([
      { questId: 901, reward: FIRST_REWARD },
      { questId: 902, reward: FIRST_REWARD },
    ]);
  });
});

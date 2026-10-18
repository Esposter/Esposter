import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { advanceCommissionForQuest } from "#src/services/commission/advanceCommissionForQuest";
import { checkIsCommissionFinished } from "#src/services/commission/checkIsCommissionFinished";
import { describe, expect, test } from "vitest";

describe(advanceCommissionForQuest, () => {
  const DEALT_RANK = 12;
  const QUEST_ID = "2000101";
  const OTHER_QUEST_ID = "2001101";
  const questTask: Commission = {
    centerPosition: "",
    enterDistance: 40,
    exitDistance: 50,
    finishKind: CommissionFinishKind.None,
    finishProgress: 1,
    id: 20_500,
    kind: CommissionKind.Quest,
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 2003,
    questId: QUEST_ID,
    rewardTier: 2,
  };
  const slice: CommissionSlice = { bonuses: [], rewardTiers: [], tasks: [questTask] };
  const day: CommissionDay = {
    claimedCommissionIds: [],
    dealtAt: Temporal.Instant.fromEpochMilliseconds(0),
    dealtCommissions: [{ commissionId: questTask.id, count: 0, dealtRank: DEALT_RANK }],
  };

  test("a quest task finishes with its quest", () => {
    expect.hasAssertions();
    const advancedDay = advanceCommissionForQuest(day, slice, QUEST_ID);
    expect(advancedDay.dealtCommissions).toStrictEqual([
      { commissionId: questTask.id, count: 1, dealtRank: DEALT_RANK },
    ]);
    expect(
      advancedDay.dealtCommissions.map((progress) => checkIsCommissionFinished(progress, questTask)),
    ).toStrictEqual([true]);
  });

  test("a quest task stays unfinished while its quest is in progress", () => {
    expect.hasAssertions();
    expect(advanceCommissionForQuest(day, slice, OTHER_QUEST_ID)).toStrictEqual(day);
  });
});

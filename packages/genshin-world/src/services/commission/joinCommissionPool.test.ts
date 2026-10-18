import type { Commission } from "#src/models/commission/Commission";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { joinCommissionPool } from "#src/services/commission/joinCommissionPool";
import { describe, expect, test } from "vitest";

describe(joinCommissionPool, () => {
  const OPENING_QUEST_ID = 1001;
  const task: Commission = {
    centerPosition: "",
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.None,
    finishProgress: 1,
    id: 2001,
    kind: CommissionKind.Quest,
    nameTextId: "2001",
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 3001,
    preferredRegion: "liyue",
    questId: "7",
    rewardTier: 2,
  };
  const slice: CommissionSlice = { bonuses: [], openingQuestId: OPENING_QUEST_ID, rewardTiers: [], tasks: [task] };

  test("a region's commissions join the deal once its quest is done", () => {
    expect.hasAssertions();
    expect(joinCommissionPool([slice], new Set([OPENING_QUEST_ID]))).toStrictEqual([task]);
  });

  test("a region's commissions do not join the deal before its quest is done", () => {
    expect.hasAssertions();
    expect(joinCommissionPool([slice], new Set())).toStrictEqual([]);
  });

  test("a region no quest is named for joins as it is read", () => {
    expect.hasAssertions();
    expect(joinCommissionPool([{ bonuses: [], rewardTiers: [], tasks: [task] }], new Set())).toStrictEqual([task]);
  });
});

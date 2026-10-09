import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { advanceCommission } from "#src/services/commission/advanceCommission";
import { describe, expect, test } from "vitest";

describe(advanceCommission, () => {
  const FINISH_PROGRESS = 3;
  const commission: Commission = {
    centerPosition: "Event_1",
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: FINISH_PROGRESS,
    id: 1,
    kind: CommissionKind.Scene,
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    questId: "",
    rewardTier: 2,
  };

  test("should count the doings up to the finish count and hold there", () => {
    expect.hasAssertions();
    const progress = { commissionId: 1, count: 2, dealtRank: 1 };
    expect(advanceCommission(progress, commission, 1)).toStrictEqual({ ...progress, count: FINISH_PROGRESS });
    expect(advanceCommission(progress, commission, 5)).toStrictEqual({ ...progress, count: FINISH_PROGRESS });
  });
});

import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { describe } from "vitest";

// A scene commission the commission suites deal, claim and count, with the fields a suite varies passed as overrides
export const createCommission = (id: number, overrides: Partial<Commission> = {}): Commission => ({
  centerPosition: `Event_${id}`,
  enterDistance: 40,
  exitDistance: 60,
  finishKind: CommissionFinishKind.Monster,
  finishProgress: 8,
  id,
  kind: CommissionKind.Scene,
  nameTextId: "1",
  newGroupIds: [],
  oldGroupIds: [],
  poolId: 1001,
  preferredRegion: "mondstadt",
  questId: "",
  rewardTier: 2,
  ...overrides,
});

describe.todo("createCommission");

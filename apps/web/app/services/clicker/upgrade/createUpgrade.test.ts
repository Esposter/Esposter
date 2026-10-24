import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { describe } from "vitest";

// A bought upgrade with the given effects, which is all the evaluation helpers read of one
export const createUpgrade = (id: UpgradeId, effects: Effect[]): Upgrade => ({
  description: "",
  effects,
  flavorDescription: "",
  id,
  price: 1,
  unlockConditions: [],
});

describe.todo("createUpgrade");

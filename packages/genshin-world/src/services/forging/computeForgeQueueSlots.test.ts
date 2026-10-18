import type { ForgeOrder } from "#src/models/forging/ForgeOrder";

import { computeForgeQueueSlots } from "#src/services/forging/computeForgeQueueSlots";
import { ForgeQueueState } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeForgeQueueSlots, () => {
  const now = Temporal.Instant.fromEpochMilliseconds(0);

  test("a queue shows its orders", () => {
    expect.hasAssertions();

    const orders: ForgeOrder[] = [
      { count: 5, recipeId: 11_001, startedAt: now.subtract({ seconds: 6 }), unitSeconds: 3 },
      { count: 2, recipeId: 11_002, startedAt: now.subtract({ seconds: 12 }), unitSeconds: 6 },
    ];

    expect(computeForgeQueueSlots(orders, 5, now)).toStrictEqual([
      { forged: 2, id: 1, recipeId: 11_001, remainingSeconds: 9, state: ForgeQueueState.Forging, unlockRank: 1 },
      { forged: 2, id: 2, recipeId: 11_002, remainingSeconds: 0, state: ForgeQueueState.Complete, unlockRank: 5 },
      { forged: 0, id: 3, recipeId: undefined, remainingSeconds: 0, state: ForgeQueueState.Locked, unlockRank: 10 },
      { forged: 0, id: 4, recipeId: undefined, remainingSeconds: 0, state: ForgeQueueState.Locked, unlockRank: 15 },
    ]);
  });
});

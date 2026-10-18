import type { ForgeOrder } from "#src/models/forging/ForgeOrder";
import type { ForgeQueueSlot } from "#src/models/forging/ForgeQueueSlot";

import { computeForgeOrderDoneCount } from "#src/services/forging/computeForgeOrderDoneCount";
import { FORGE_QUEUE_PLAYER_LEVELS } from "#src/services/forging/constants";
import { ForgeQueueState } from "genshin-interface";

// The queues at the blacksmith at `now`, one for each rank that opens one, each holding the order in its place in the forge
// State: forging while units are left, complete once every unit is done and waits to be obtained, idle while no order is in
// It, and locked until the Adventure Rank that opens it
export const computeForgeQueueSlots = (
  orders: ForgeOrder[],
  adventureRank: number,
  now: Temporal.Instant,
): ForgeQueueSlot[] =>
  FORGE_QUEUE_PLAYER_LEVELS.map((unlockRank, index) => {
    const id = index + 1;
    const order = orders[index];
    if (!order)
      return {
        forged: 0,
        id,
        recipeId: undefined,
        remainingSeconds: 0,
        state: adventureRank >= unlockRank ? ForgeQueueState.Idle : ForgeQueueState.Locked,
        unlockRank,
      };
    const forged = computeForgeOrderDoneCount(order, now);
    const remainingSeconds = order.count * order.unitSeconds - now.since(order.startedAt).total({ unit: "second" });
    return {
      forged,
      id,
      recipeId: order.recipeId,
      remainingSeconds: Math.max(0, Math.ceil(remainingSeconds)),
      state: forged === order.count ? ForgeQueueState.Complete : ForgeQueueState.Forging,
      unlockRank,
    };
  });

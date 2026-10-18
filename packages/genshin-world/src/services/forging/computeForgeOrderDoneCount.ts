import type { ForgeOrder } from "#src/models/forging/ForgeOrder";

// The units of an order done by `now`: each takes its seconds after the one before it, from the moment the order began,
// So the count is read from the seconds elapsed, never past the order's own count
export const computeForgeOrderDoneCount = (order: ForgeOrder, now: Temporal.Instant): number => {
  const elapsedSeconds = now.since(order.startedAt).total({ unit: "second" });
  return Math.min(order.count, Math.max(Math.floor(elapsedSeconds / order.unitSeconds), 0));
};

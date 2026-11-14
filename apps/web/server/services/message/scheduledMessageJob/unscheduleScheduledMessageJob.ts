import { useScheduler } from "#server/composables/scheduler/useScheduler";
import { getResultAsync, noop } from "@esposter/shared";

// Best-effort, because the row is already cancelled: the delivery handler skips a cancelled job, so an alarm that
// Survives this only costs one queue message that does nothing
export const unscheduleScheduledMessageJob = (id: string): Promise<void> =>
  getResultAsync(() => useScheduler(id).cancel()).match(noop, console.error);

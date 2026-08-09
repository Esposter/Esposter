import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const { items, ...restOffsetPaginationData } = useOffsetPaginationData<ScheduledMessageJobInMessageWithRoom>();
  const count = ref(0);
  const isPending = ref(true);
  const removeScheduledMessageJob = (id: ScheduledMessageJobInMessage["id"]) => {
    const remainingScheduledMessageJobs = items.value.filter((scheduledMessageJob) => scheduledMessageJob.id !== id);
    // The badge counts every scheduled job, not just the loaded page, so it only moves when this page really
    // Lost a row — a cancel of something not on screen would otherwise decrement it for nothing
    if (remainingScheduledMessageJobs.length === items.value.length) return;

    items.value = remainingScheduledMessageJobs;
    count.value = Math.max(0, count.value - 1);
  };
  return { count, isPending, items, removeScheduledMessageJob, ...restOffsetPaginationData };
});

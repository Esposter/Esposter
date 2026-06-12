import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const items = ref<ScheduledMessageJobInMessageWithRoom[]>([]);
  const count = ref(0);
  const hasMore = ref(false);
  const isPending = ref(true);
  const removeScheduledMessageJob = (id: ScheduledMessageJobInMessage["id"]) => {
    items.value = items.value.filter((scheduledMessageJob) => scheduledMessageJob.id !== id);
    count.value = Math.max(0, count.value - 1);
  };
  return { count, hasMore, isPending, items, removeScheduledMessageJob };
});

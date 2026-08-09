import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJob = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { removeScheduledMessageJob } = scheduledMessageJobStore;
  const { count, items } = storeToRefs(scheduledMessageJobStore);
  return async (id: ScheduledMessageJobInMessage["id"]) => {
    await executeMutation(() => $trpc.message.scheduledMessageJob.cancelScheduledJob.mutate({ id }), {
      // The one row this write cancels, not a copy of the page: reinstating the page would resurrect a job
      // Another cancel already took off it and drop whatever the page gained while this write was in flight
      applyOptimistic: () => {
        const cancelledScheduledMessageJob = items.value.find((scheduledMessageJob) => scheduledMessageJob.id === id);
        removeScheduledMessageJob(id);
        return () => {
          if (!cancelledScheduledMessageJob) return;

          // Back at the end of the page rather than where it stood — a cosmetic loss, taken over dropping a row
          items.value = [...items.value, cancelledScheduledMessageJob];
          count.value += 1;
        };
      },
      key: id,
    });
  };
};

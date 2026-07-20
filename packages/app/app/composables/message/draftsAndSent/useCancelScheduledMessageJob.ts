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
      applyOptimistic: () => {
        const itemsSnapshot = items.value;
        const countSnapshot = count.value;
        removeScheduledMessageJob(id);
        return () => {
          items.value = itemsSnapshot;
          count.value = countSnapshot;
        };
      },
      key: id,
    });
  };
};

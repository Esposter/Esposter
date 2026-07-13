import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useCancelScheduledMessageJob = () => {
  const { $trpc } = useNuxtApp();
  const executeMutation = useMutation();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { removeScheduledMessageJob } = scheduledMessageJobStore;
  return async (id: ScheduledMessageJobInMessage["id"]) => {
    await executeMutation(() => $trpc.message.scheduledMessageJob.cancelScheduledJob.mutate({ id }), {
      onSuccess: () => {
        removeScheduledMessageJob(id);
      },
    });
  };
};

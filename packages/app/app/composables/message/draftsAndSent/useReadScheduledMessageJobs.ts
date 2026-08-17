import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { withFinalizerAsync } from "@esposter/shared";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { readItems } = scheduledMessageJobStore;
  const { count, hasMore, isPending, items } = storeToRefs(scheduledMessageJobStore);
  const readScheduledMessageJobs = () =>
    readItems(
      async () => {
        const [data, total] = await Promise.all([
          $trpc.message.scheduledMessageJob.readMyScheduledJobs.query(),
          $trpc.message.scheduledMessageJob.readMyScheduledJobsCount.query(),
        ]);
        count.value = total;
        return data;
      },
      {
        onComplete: () => {
          isPending.value = false;
        },
      },
    );
  const readMoreScheduledMessageJobs = (onComplete: () => void) =>
    withFinalizerAsync(async () => {
      const data = await $trpc.message.scheduledMessageJob.readMyScheduledJobs.query({ offset: items.value.length });
      items.value = [...items.value, ...data.items];
      hasMore.value = data.hasMore;
    }, onComplete);
  return { readMoreScheduledMessageJobs, readScheduledMessageJobs };
};

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { withFinalizerAsync } from "@esposter/shared";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { count, hasMore, isPending, items } = storeToRefs(scheduledMessageJobStore);
  const readScheduledMessageJobs = () =>
    withFinalizerAsync(
      async () => {
        const [data, total] = await Promise.all([
          $trpc.message.scheduledMessageJob.readMyScheduledJobs.query(),
          $trpc.message.scheduledMessageJob.readMyScheduledJobsCount.query(),
        ]);
        items.value = data.items;
        count.value = total;
        hasMore.value = data.hasMore;
      },
      () => {
        isPending.value = false;
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

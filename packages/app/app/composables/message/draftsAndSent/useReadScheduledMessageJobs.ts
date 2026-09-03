import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { readItems, readMoreItems } = scheduledMessageJobStore;
  const { isPending, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
  const readScheduledMessageJobs = () =>
    readItems(
      async () => {
        const [scheduledMessageJobs, count] = await Promise.all([
          $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query(),
          $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(),
        ]);
        scheduledMessageJobCount.value = count;
        return scheduledMessageJobs;
      },
      () => {
        isPending.value = false;
      },
    );
  const readMoreScheduledMessageJobs = (onComplete: () => void) =>
    readMoreItems(
      (offset) => $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query({ offset }),
      onComplete,
    );
  return { readMoreScheduledMessageJobs, readScheduledMessageJobs };
};

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { readItems, readMoreItems } = scheduledMessageJobStore;
  const { count, isPending } = storeToRefs(scheduledMessageJobStore);
  const readScheduledMessageJobs = () =>
    readItems(
      async () => {
        const [data, total] = await Promise.all([
          $trpc.message.scheduledMessageJob.readMyScheduledJobs.query(),
          $trpc.message.scheduledMessageJob.countMyScheduledJobs.query(),
        ]);
        count.value = total;
        return data;
      },
      () => {
        isPending.value = false;
      },
    );
  const readMoreScheduledMessageJobs = (onComplete: () => void) =>
    readMoreItems((offset) => $trpc.message.scheduledMessageJob.readMyScheduledJobs.query({ offset }), onComplete);
  return { readMoreScheduledMessageJobs, readScheduledMessageJobs };
};

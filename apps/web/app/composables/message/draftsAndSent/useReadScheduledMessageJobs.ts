import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { readItems, readMoreItems } = scheduledMessageJobStore;
  const { scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
  const queryScheduledMessageJobCount = () => $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query();
  const readScheduledMessageJobCount = async () => {
    scheduledMessageJobCount.value = await queryScheduledMessageJobCount();
  };
  const readScheduledMessageJobs = () =>
    readItems(async () => {
      const [scheduledMessageJobs, count] = await Promise.all([
        $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query(),
        queryScheduledMessageJobCount(),
      ]);
      scheduledMessageJobCount.value = count;
      return scheduledMessageJobs;
    });
  const readMoreScheduledMessageJobs = (onComplete: () => void) =>
    readMoreItems(
      (offset) => $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query({ offset }),
      onComplete,
    );
  return { readMoreScheduledMessageJobs, readScheduledMessageJobCount, readScheduledMessageJobs };
};

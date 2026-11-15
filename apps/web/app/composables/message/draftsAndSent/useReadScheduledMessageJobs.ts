import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";

export const useReadScheduledMessageJobs = () => {
  const { $trpc } = useNuxtApp();
  const scheduledMessageJobStore = useScheduledMessageJobStore();
  const { readItems, readMoreItems, readScheduledMessageJobCount } = scheduledMessageJobStore;
  const readScheduledMessageJobs = () =>
    readItems(async () => {
      const [page] = await Promise.all([
        $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query(),
        readScheduledMessageJobCount(),
      ]);
      return page;
    });
  const readMoreScheduledMessageJobs = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => $trpc.message.scheduledMessageJob.readMyScheduledMessageJobs.query({ cursor }),
      onComplete,
    );
  return { readMoreScheduledMessageJobs, readScheduledMessageJobCount, readScheduledMessageJobs };
};

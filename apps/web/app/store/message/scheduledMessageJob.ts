import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { MutationStatus } from "@/models/shared/MutationStatus";

// A scheduled item is named by its id and its room, which is what both of its writes take
type ScheduledMessageJobKey = Pick<ScheduledMessageJobWithRoom, "id" | "roomId">;

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const { $trpc } = useNuxtApp();
  // One executor for both writes, because a queue lives on the instance and not on the key: sending and
  // Cancelling take the same job off the page, so on two instances the shared `key: id` would read as if they
  // Serialised while they in fact raced, and the rejected one would put the row back over the other's removal
  const { executeMutation: executeScheduledMessageJobMutation } = useMutation();
  const { items, ...restOffsetPaginationData } = useOffsetPaginationData<ScheduledMessageJobWithRoom>();
  const scheduledMessageJobCount = ref(0);
  const deleteScheduledMessageJob = (id: ScheduledMessageJobWithRoom["id"]) => {
    const remainingScheduledMessageJobs = items.value.filter((scheduledMessageJob) => scheduledMessageJob.id !== id);
    // The badge counts every scheduled job, not just the loaded page, so it only moves when this page really
    // Lost a row — a cancel of something not on screen would otherwise decrement it for nothing
    if (remainingScheduledMessageJobs.length === items.value.length) return;

    items.value = remainingScheduledMessageJobs;
    scheduledMessageJobCount.value = Math.max(0, scheduledMessageJobCount.value - 1);
  };
  // Cancelling and sending end the job the same way, so they share one optimistic apply. The row is read when
  // The write is sent, so the second of two queued writes on one job finds it already gone and owes nothing back
  const getApplyOptimisticDelete = (id: ScheduledMessageJobWithRoom["id"]) => () => {
    const deletedScheduledMessageJob = items.value.find((scheduledMessageJob) => scheduledMessageJob.id === id);
    deleteScheduledMessageJob(id);
    return () => {
      if (!deletedScheduledMessageJob) return;
      // Back at the end of the page rather than where it stood — a cosmetic loss, taken over dropping a row
      items.value = [...items.value, deletedScheduledMessageJob];
      scheduledMessageJobCount.value += 1;
    };
  };
  const cancelScheduledMessageJob = async ({ id, roomId }: ScheduledMessageJobKey) => {
    const outcome = await executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessageJob.cancelScheduledMessageJob.mutate({ id, roomId }),
      { applyOptimistic: getApplyOptimisticDelete(id), key: id },
    );
    // A rejected cancel rolls the row back, so the job is still scheduled and a caller must not treat it as cancelled
    return outcome.status === MutationStatus.Succeeded;
  };
  // A reminder posts nothing, so only a scheduled message is sent now, through the room it is held by
  const sendScheduledMessageNow = async ({ id, roomId }: ScheduledMessageJobKey) => {
    await executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessage.sendScheduledMessageNow.mutate({ id, roomId }),
      { applyOptimistic: getApplyOptimisticDelete(id), key: id },
    );
  };
  return {
    cancelScheduledMessageJob,
    deleteScheduledMessageJob,
    items,
    scheduledMessageJobCount,
    sendScheduledMessageNow,
    ...restOffsetPaginationData,
  };
});

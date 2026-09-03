import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const { $trpc } = useNuxtApp();
  // One executor for both writes, because a queue lives on the instance and not on the key: sending and
  // Cancelling take the same job off the page, so on two instances the shared `key: id` would read as if they
  // Serialised while they in fact raced, and the rejected one would put the row back over the other's removal
  const { executeMutation: executeScheduledMessageJobMutation } = useMutation();
  const { items, ...restOffsetPaginationData } = useOffsetPaginationData<ScheduledMessageJobInMessageWithRoom>();
  const count = ref(0);
  const isPending = ref(true);
  const removeScheduledMessageJob = (id: ScheduledMessageJobInMessage["id"]) => {
    const remainingScheduledMessageJobs = items.value.filter((scheduledMessageJob) => scheduledMessageJob.id !== id);
    // The badge counts every scheduled job, not just the loaded page, so it only moves when this page really
    // Lost a row — a cancel of something not on screen would otherwise decrement it for nothing
    if (remainingScheduledMessageJobs.length === items.value.length) return;

    items.value = remainingScheduledMessageJobs;
    count.value = Math.max(0, count.value - 1);
  };
  // Cancelling and sending end the job the same way, so they share one optimistic apply. The row is read when
  // The write is sent, so the second of two queued writes on one job finds it already gone and owes nothing back
  const getApplyOptimisticRemoval = (id: ScheduledMessageJobInMessage["id"]) => () => {
    const removedScheduledMessageJob = items.value.find((scheduledMessageJob) => scheduledMessageJob.id === id);
    removeScheduledMessageJob(id);
    return () => {
      if (!removedScheduledMessageJob) return;
      // Back at the end of the page rather than where it stood — a cosmetic loss, taken over dropping a row
      items.value = [...items.value, removedScheduledMessageJob];
      count.value += 1;
    };
  };
  const cancelScheduledMessageJob = async (id: ScheduledMessageJobInMessage["id"]) => {
    await executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessageJob.cancelScheduledMessageJob.mutate({ id }),
      { applyOptimistic: getApplyOptimisticRemoval(id), key: id },
    );
  };
  const sendScheduledMessageNow = async (id: ScheduledMessageJobInMessage["id"]) => {
    await executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessageJob.sendScheduledMessageNow.mutate({ id }),
      { applyOptimistic: getApplyOptimisticRemoval(id), key: id },
    );
  };
  return {
    cancelScheduledMessageJob,
    count,
    isPending,
    items,
    removeScheduledMessageJob,
    sendScheduledMessageNow,
    ...restOffsetPaginationData,
  };
});

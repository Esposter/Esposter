import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";

import { getRestoredItems } from "#src/services/shared/getRestoredItems";

// A scheduled item is named by its id and its room, which is what both of its writes take
type ScheduledMessageJobKey = Pick<ScheduledMessageJobWithRoom, "id" | "roomId">;

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const { $trpc } = useNuxtApp();
  // One executor for both writes, because a queue lives on the instance and not on the key: sending and
  // Cancelling take the same job off the page, so on two instances the shared `key: id` would read as if they
  // Serialised while they in fact raced, and the rejected one would put the row back over the other's removal
  const { executeMutation: executeScheduledMessageJobMutation } = useMutation();
  // The count is one aggregate on its own executor, so its reads share one key and the latest read to start is the
  // One whose answer lands
  const { executeQuery: executeScheduledMessageJobCountQuery } = useMutation();
  const { items, ...restCursorPaginationData } = useCursorPaginationData<ScheduledMessageJobWithRoom>();
  const scheduledMessageJobCount = ref(0);
  // The badge counts every job the user has, not just the page on screen, and the server holds that count. A write
  // That settles reads it again rather than adjusting it, since the row it removed is one of many. A failed read keeps
  // The last count and the tRPC link alerts it, so it never fails the write that settled before it
  const readScheduledMessageJobCount = async () => {
    await executeScheduledMessageJobCountQuery(
      () => $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(),
      {
        key: "scheduledMessageJobCount",
        onError: console.error,
        onSuccess: (count) => {
          scheduledMessageJobCount.value = count;
        },
      },
    );
  };
  const deleteScheduledMessageJob = (id: ScheduledMessageJobWithRoom["id"]) => {
    items.value = items.value.filter((scheduledMessageJob) => scheduledMessageJob.id !== id);
  };
  // Cancelling and sending end the job the same way, so they share one optimistic apply. The row is read when
  // The write is sent, so the second of two queued writes on one job finds it already gone and owes nothing back
  const getApplyOptimisticDelete = (id: ScheduledMessageJobWithRoom["id"]) => () => {
    const deletedIndex = items.value.findIndex((scheduledMessageJob) => scheduledMessageJob.id === id);
    const deletedScheduledMessageJob = items.value[deletedIndex];
    deleteScheduledMessageJob(id);
    return () => {
      if (!deletedScheduledMessageJob) return;
      // Back at the index it held on the page, which is the order the server answers the tab in
      items.value = getRestoredItems(items.value, deletedScheduledMessageJob, deletedIndex);
    };
  };
  // A cancel is drawn at once: the job leaves the page as the cancel is sent. A refused cancel puts the job back where it
  // Stood, and then runs `rollback` for whatever the caller drew beside it
  const cancelScheduledMessageJob = ({ id, roomId }: ScheduledMessageJobKey, rollback?: () => void) => {
    const applyOptimisticDelete = getApplyOptimisticDelete(id);
    executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessageJob.cancelScheduledMessageJob.mutate({ id, roomId }),
      {
        applyOptimistic: () => {
          const undoDelete = applyOptimisticDelete();
          return () => {
            undoDelete();
            rollback?.();
          };
        },
        key: id,
        reconcile: readScheduledMessageJobCount,
      },
    );
  };
  // A reminder posts nothing, so only a scheduled message is sent now, through the room it is held by
  const sendScheduledMessageNow = ({ id, roomId }: ScheduledMessageJobKey) => {
    executeScheduledMessageJobMutation(
      () => $trpc.message.scheduledMessage.sendScheduledMessageNow.mutate({ id, roomId }),
      { applyOptimistic: getApplyOptimisticDelete(id), key: id, reconcile: readScheduledMessageJobCount },
    );
  };
  return {
    cancelScheduledMessageJob,
    items,
    readScheduledMessageJobCount,
    scheduledMessageJobCount,
    sendScheduledMessageNow,
    ...restCursorPaginationData,
  };
});

import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { Page } from "@esposter/db-schema";

import { createSingleFlight } from "#src/services/shared/createSingleFlight";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createTable } from "#src/services/shared/overlay/createTable";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { remindersInUser, ScheduledMessageJobType, scheduledMessagesInRoom } from "@esposter/db-schema";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

// A reminder is held as the row its person holds and a scheduled message as the row its room holds, so a cancel or a send
// Leaves that row a tombstone the list reads back
const reminderTable = createTable(remindersInUser);
const scheduledMessageTable = createTable(scheduledMessagesInRoom);

// The fields each table's row holds for a job, without the version or deletion each write sets over it
type JobPayload<TType extends ScheduledMessageJobWithRoom["payload"]["type"]> = Extract<
  ScheduledMessageJobWithRoom["payload"],
  { type: TType }
>;
const getReminderRow = (
  job: ScheduledMessageJobWithRoom,
  { text }: JobPayload<typeof ScheduledMessageJobType.Reminder>,
) => ({ id: job.id, roomId: job.roomId, runAt: job.runAt, text });
const getScheduledMessageRow = (
  job: ScheduledMessageJobWithRoom,
  { message, replyToId }: JobPayload<typeof ScheduledMessageJobType.ScheduledMessage>,
  sessionUserId: string,
) => ({ id: job.id, message, replyToId, runAt: job.runAt, userId: sessionUserId });

// The job's row as a tombstone, drawn at once: a cancel and a send both end the job the same way. It is built from the job
// The list holds, so it needs no row arrived first
const getTombstoneEntry =
  (job: ScheduledMessageJobWithRoom, sessionUserId: string, deletedAt: Date): Entry =>
  (view) => {
    if (job.payload.type === ScheduledMessageJobType.Reminder) {
      view.set(reminderTable, [job.id], { ...getReminderRow(job, job.payload), deletedAt });
      return;
    }

    view.set(scheduledMessageTable, [job.id], {
      ...getScheduledMessageRow(job, job.payload, sessionUserId),
      deletedAt,
    });
  };

export const useScheduledMessageJobStore = defineStore("message/scheduledMessageJob", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const reminders = view(reminderTable);
  const scheduledMessages = view(scheduledMessageTable);
  // The page names the jobs in the order the server gives them. Each job's row arrives at the version its page read it at,
  // So a read that lands after a cancel cannot list the job again
  const {
    items: pageItems,
    readItems: readPageItems,
    readMoreItems: readMorePageItems,
    ...restCursorPaginationData
  } = useCursorPaginationData<ScheduledMessageJobWithRoom>();
  const arriveJobs = ({ items: jobs }: Page<ScheduledMessageJobWithRoom>) => {
    for (const job of jobs)
      if (job.payload.type === ScheduledMessageJobType.Reminder)
        arrive(reminderTable, { ...getReminderRow(job, job.payload), deletedAt: null, version: job.version });
      else
        arrive(scheduledMessageTable, {
          ...getScheduledMessageRow(job, job.payload, userId.value),
          deletedAt: null,
          version: job.version,
        });
  };
  // A job is listed while its row is live in the overlay. The page is the membership, and the view holds only live rows, so
  // A cancel or a send that tombstones a job's row takes it off the list the moment that write is sent
  const items = computed(() => {
    const liveIds = new Set([...reminders.value, ...scheduledMessages.value].map(({ id }) => id));
    return pageItems.value.filter(({ id }) => liveIds.has(id));
  });
  // The badge counts every job the user has, not just the page on screen, so the server holds that count and it is read
  // Again once a write settles, rather than adjusted. One read runs at a time, and a failed read keeps the last count
  const scheduledMessageJobCount = ref(0);
  const flushScheduledMessageJobCount = createSingleFlight(async () => {
    scheduledMessageJobCount.value = await $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query();
  });
  const readScheduledMessageJobCount = () => getResultAsync(flushScheduledMessageJobCount).match(noop, console.error);
  const readItems: typeof readPageItems = (query, options) =>
    readPageItems(async () => {
      const page = await query();
      arriveJobs(page);
      return page;
    }, options);
  const readMoreItems: typeof readMorePageItems = (query, onComplete) =>
    readMorePageItems(async (cursor) => {
      const page = await query(cursor);
      arriveJobs(page);
      return page;
    }, onComplete);
  // A cancel is drawn at once. The tombstone its answer names confirms the entry, and a refused cancel drops the entry, so
  // The job is listed again with nothing restored. `onCancelled` runs once the server has answered, so a caller's own
  // Follow-up never runs for a cancel that was refused
  const cancelScheduledMessageJob = (job: ScheduledMessageJobWithRoom, onCancelled?: () => void) => {
    const deletedAt = new Date();
    writeOptimistic(
      async () => {
        const cancelled = await withFinalizerAsync(
          () => $trpc.message.scheduledMessageJob.cancelScheduledMessageJob.mutate({ id: job.id, roomId: job.roomId }),
          readScheduledMessageJobCount,
        );
        onCancelled?.();
        return cancelled.kind === ScheduledMessageJobType.Reminder
          ? createRowResponse(reminderTable, cancelled.row)
          : createRowResponse(scheduledMessageTable, cancelled.row);
      },
      { entry: getTombstoneEntry(job, userId.value, deletedAt), onError: createErrorAlert },
    );
  };
  // A reminder posts nothing, so only a scheduled message is sent now, through the room it is held by
  const sendScheduledMessageNow = (job: ScheduledMessageJobWithRoom) => {
    const deletedAt = new Date();
    writeOptimistic(
      async () => {
        const sentScheduledMessage = await withFinalizerAsync(
          () => $trpc.message.scheduledMessage.sendScheduledMessageNow.mutate({ id: job.id, roomId: job.roomId }),
          readScheduledMessageJobCount,
        );
        return createRowResponse(scheduledMessageTable, sentScheduledMessage);
      },
      { entry: getTombstoneEntry(job, userId.value, deletedAt), onError: createErrorAlert },
    );
  };
  return {
    cancelScheduledMessageJob,
    items,
    readItems,
    readMoreItems,
    readScheduledMessageJobCount,
    scheduledMessageJobCount,
    sendScheduledMessageNow,
    ...restCursorPaginationData,
  };
});

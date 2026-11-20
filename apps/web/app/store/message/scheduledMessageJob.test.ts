// @vitest-environment nuxt
import { createScheduledMessageJob } from "#src/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The row a cancel or a send leaves in its room, a tombstone at the version its write named
const createTombstone = (jobId: string, version: number) => ({
  deletedAt: new Date(0),
  id: jobId,
  message: "",
  replyToId: null,
  runAt: new Date(0),
  userId: v7(),
  version,
});
const refuse = () => {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
};

describe(useScheduledMessageJobStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const id = v7();
  const otherId = v7();
  const room = createRoom("name");
  const createJob = (jobId: string, version = 0) => createScheduledMessageJob({ id: jobId, room, version });

  // The badge counts every job the user has, and this page holds only some of them, so a cancel is answered with the
  // Count the server now holds rather than the page's own count less the row the cancel removed
  test("takes the badge from the server once a cancel lands, since the page does not hold every job", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => ({
      kind: ScheduledMessageJobType.ScheduledMessage,
      row: createTombstone(id, 1),
    }));
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 5);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, readItems } = scheduledMessageJobStore;
    await readItems(() => Promise.resolve({ items: [createJob(id), createJob(otherId)], nextCursor: "" }));
    scheduledMessageJobCount.value = 2;
    cancelScheduledMessageJob(createJob(id));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(5);
  });

  // A job a cancel removes is drawn gone as the cancel is sent, and its answer's tombstone holds it gone, so nothing is
  // Restored when the cancel is refused: the job is listed again because the entry it drew is dropped
  test("lists a job again, as it was, when its cancel is refused", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(refuse);
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 2);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, readItems } = scheduledMessageJobStore;
    await readItems(() => Promise.resolve({ items: [createJob(id), createJob(otherId)], nextCursor: "" }));
    cancelScheduledMessageJob(createJob(id));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id, otherId]);
  });

  // A read that started before a cancel can land after its answer. The tombstone the cancel held is at a higher version than
  // The row that read names, so the read's older row is discarded and the job stays gone
  test("does not list a job again when a read that started before its cancel lands after the cancel's answer", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => ({
      kind: ScheduledMessageJobType.ScheduledMessage,
      row: createTombstone(id, 1),
    }));
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 1);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, readItems } = scheduledMessageJobStore;
    await readItems(() => Promise.resolve({ items: [createJob(id), createJob(otherId)], nextCursor: "" }));
    cancelScheduledMessageJob(createJob(id));
    await flushPromises();
    await readItems(() => Promise.resolve({ items: [createJob(id, 0), createJob(otherId)], nextCursor: "" }));

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
  });

  // A cancel and a send of one job each draw their own entry, so the refused cancel drops only its own, and the send's
  // Answer holds the job gone
  test("does not leave a sent job on the page when the cancel beside it is refused", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(refuse);
    trpcMsw.message.scheduledMessage.sendScheduledMessageNow.mutation(() => createTombstone(id, 1));
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 1);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, readItems, sendScheduledMessageNow } = scheduledMessageJobStore;
    await readItems(() => Promise.resolve({ items: [createJob(id), createJob(otherId)], nextCursor: "" }));
    scheduledMessageJobCount.value = 2;
    cancelScheduledMessageJob(createJob(id));
    sendScheduledMessageNow(createJob(id));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });
});
